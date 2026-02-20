package com.servicehub.service;

import com.servicehub.dto.ServiceHubDTOs.*;
import com.servicehub.entity.*;
import com.servicehub.exception.BadRequestException;
import com.servicehub.exception.ResourceNotFoundException;
import com.servicehub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ServiceProviderRepository providerRepository;
    private final ServiceCategoryRepository categoryRepository;
    private final AddressRepository addressRepository;
    private final ReviewRepository reviewRepository;

    @Transactional
    public BookingResponse createBooking(Long userId, CreateBookingRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ServiceProvider provider = providerRepository.findById(req.getProviderId())
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));

        if (provider.getApprovalStatus() != ServiceProvider.ApprovalStatus.APPROVED) {
            throw new BadRequestException("Provider is not approved yet");
        }

        ServiceCategory category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Address address = addressRepository.findById(req.getAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (!address.getUser().getId().equals(userId)) {
            throw new BadRequestException("Address does not belong to this user");
        }

        Booking booking = Booking.builder()
                .user(user)
                .provider(provider)
                .serviceCategory(category)
                .serviceAddress(address)
                .scheduledAt(req.getScheduledAt())
                .notes(req.getNotes())
                .totalAmount(provider.getHourlyRate())
                .status(Booking.BookingStatus.PENDING)
                .build();

        bookingRepository.save(booking);
        return BookingResponse.from(booking, false);
    }

    public Page<BookingResponse> getUserBookings(Long userId, Pageable pageable) {
        return bookingRepository.findByUserId(userId, pageable)
                .map(b -> BookingResponse.from(b, true));
    }

    public Page<BookingResponse> getProviderBookings(Long userId, Pageable pageable) {
        ServiceProvider provider = providerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));
        return bookingRepository.findByProviderId(provider.getId(), pageable)
                .map(b -> BookingResponse.from(b, false));
    }

    @Transactional
    public BookingResponse updateBookingStatus(Long bookingId, String status, Long actorId, boolean isProvider) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        Booking.BookingStatus newStatus = Booking.BookingStatus.valueOf(status.toUpperCase());

        if (isProvider) {
            // Provider can confirm, reject, start, complete
            if (!booking.getProvider().getUser().getId().equals(actorId)) {
                throw new BadRequestException("Not authorized");
            }
            if (newStatus == Booking.BookingStatus.CONFIRMED) {
                booking.setCredentialsRevealed(true);
            }
        } else {
            // User can only cancel
            if (!booking.getUser().getId().equals(actorId)) {
                throw new BadRequestException("Not authorized");
            }
            if (newStatus != Booking.BookingStatus.CANCELLED) {
                throw new BadRequestException("Users can only cancel bookings");
            }
        }

        booking.setStatus(newStatus);
        bookingRepository.save(booking);
        return BookingResponse.from(booking, true);
    }

    @Transactional
    public ReviewResponse submitReview(Long userId, CreateReviewRequest req) {
        Booking booking = bookingRepository.findById(req.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getUser().getId().equals(userId)) {
            throw new BadRequestException("Not your booking");
        }
        if (booking.getStatus() != Booking.BookingStatus.COMPLETED) {
            throw new BadRequestException("Can only review completed bookings");
        }
        if (reviewRepository.existsByBookingId(req.getBookingId())) {
            throw new BadRequestException("Review already submitted");
        }

        User user = userRepository.findById(userId).orElseThrow();
        Review review = Review.builder()
                .booking(booking)
                .user(user)
                .provider(booking.getProvider())
                .rating(req.getRating())
                .comment(req.getComment())
                .build();
        reviewRepository.save(review);

        // Update provider avg rating
        ServiceProvider provider = booking.getProvider();
        Double avgRating = reviewRepository.calculateAvgRating(provider.getId());
        long count = reviewRepository.findByProviderId(provider.getId(),
                org.springframework.data.domain.Pageable.unpaged()).getTotalElements();
        provider.setAvgRating(avgRating != null ? avgRating : 0.0);
        provider.setTotalRatings((int) count);
        providerRepository.save(provider);

        return ReviewResponse.from(review);
    }
}

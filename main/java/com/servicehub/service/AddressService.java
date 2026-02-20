package com.servicehub.service;

import com.servicehub.dto.ServiceHubDTOs.*;
import com.servicehub.entity.Address;
import com.servicehub.entity.User;
import com.servicehub.exception.BadRequestException;
import com.servicehub.exception.ResourceNotFoundException;
import com.servicehub.repository.AddressRepository;
import com.servicehub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public List<AddressResponse> getUserAddresses(Long userId) {
        return addressRepository.findByUserId(userId).stream()
                .map(AddressResponse::from).toList();
    }

    @Transactional
    public AddressResponse addAddress(Long userId, AddressRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // If new address is default, unset others
        if (Boolean.TRUE.equals(req.getIsDefault())) {
            addressRepository.findByUserIdAndIsDefaultTrue(userId)
                    .ifPresent(a -> { a.setIsDefault(false); addressRepository.save(a); });
        }

        Address address = Address.builder()
                .user(user).label(req.getLabel()).street(req.getStreet())
                .city(req.getCity()).state(req.getState()).pincode(req.getPincode())
                .country(req.getCountry()).latitude(req.getLatitude())
                .longitude(req.getLongitude()).isDefault(req.getIsDefault())
                .build();
        addressRepository.save(address);
        return AddressResponse.from(address);
    }

    @Transactional
    public AddressResponse updateAddress(Long userId, Long addressId, AddressRequest req) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (!address.getUser().getId().equals(userId)) {
            throw new BadRequestException("Not authorized");
        }

        if (Boolean.TRUE.equals(req.getIsDefault())) {
            addressRepository.findByUserIdAndIsDefaultTrue(userId)
                    .ifPresent(a -> { a.setIsDefault(false); addressRepository.save(a); });
        }

        address.setLabel(req.getLabel());
        address.setStreet(req.getStreet());
        address.setCity(req.getCity());
        address.setState(req.getState());
        address.setPincode(req.getPincode());
        address.setCountry(req.getCountry());
        address.setIsDefault(req.getIsDefault());
        addressRepository.save(address);
        return AddressResponse.from(address);
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        if (!address.getUser().getId().equals(userId)) {
            throw new BadRequestException("Not authorized");
        }
        addressRepository.delete(address);
    }
}

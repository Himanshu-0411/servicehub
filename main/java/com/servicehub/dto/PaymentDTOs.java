package com.servicehub.dto;

import lombok.*;
import java.time.LocalDateTime;

public class PaymentDTOs {

    /** Returned when user clicks "Pay Now" — frontend shows payment modal with this */
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PaymentOrderResponse {
        private String orderId;
        private Long bookingId;
        private Double amount;
        private String currency;
        private String providerName;
        private String categoryName;
        private LocalDateTime scheduledAt;
    }

    /** Sent by frontend after user fills payment details */
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ProcessPaymentRequest {
        private Long bookingId;
        private String method;        // UPI / CARD / NET_BANKING / WALLET

        // UPI fields
        private String upiId;

        // Card fields
        private String cardNumber;    // only last 4 stored
        private String cardLast4;
        private String cardNetwork;
        private String cardExpiry;
        private String cardCvv;       // never stored
        private String cardHolderName;

        // Net banking
        private String bankName;
    }

    /** Returned after processing */
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PaymentResponse {
        private String transactionId;
        private Long bookingId;
        private Double amount;
        private String status;        // SUCCESS / FAILED / REFUNDED / NOT_PAID
        private String method;
        private LocalDateTime paidAt;
        private String message;
    }
}

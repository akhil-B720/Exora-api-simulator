package com.exora.exception;

public class DuplicateEndpointException extends RuntimeException {
    public DuplicateEndpointException(String message) {
        super(message);
    }
}

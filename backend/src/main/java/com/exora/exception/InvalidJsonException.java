package com.exora.exception;

public class InvalidJsonException extends RuntimeException {
    public InvalidJsonException(String message) {
        super(message);
    }
}

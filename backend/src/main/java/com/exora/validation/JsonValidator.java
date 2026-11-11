package com.exora.validation;

import com.exora.exception.InvalidJsonException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

@Component
public class JsonValidator {

    private final ObjectMapper objectMapper;

    public JsonValidator(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public void validateJson(String jsonString) {
        if (jsonString == null || jsonString.trim().isEmpty()) {
            return;
        }
        try {
            objectMapper.readTree(jsonString);
        } catch (JsonProcessingException e) {
            throw new InvalidJsonException("Response body contains invalid JSON: " + e.getOriginalMessage());
        }
    }

    public boolean isValidJson(String jsonString) {
        if (jsonString == null || jsonString.trim().isEmpty()) {
            return true;
        }
        try {
            objectMapper.readTree(jsonString);
            return true;
        } catch (JsonProcessingException e) {
            return false;
        }
    }
}

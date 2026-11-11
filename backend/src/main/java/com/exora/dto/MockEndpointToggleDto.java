package com.exora.dto;

import jakarta.validation.constraints.NotNull;

public class MockEndpointToggleDto {

    @NotNull(message = "Enabled flag is required")
    private Boolean enabled;

    public MockEndpointToggleDto() {
    }

    public MockEndpointToggleDto(Boolean enabled) {
        this.enabled = enabled;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }
}

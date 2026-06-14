package com.techbouquet.order;

import java.util.LinkedHashMap;
import java.util.Map;

public class OrderCheckoutRequest {
    private Map<String, RecipientSnapshot> recipients = new LinkedHashMap<>();

    public Map<String, RecipientSnapshot> getRecipients() {
        return recipients;
    }

    public void setRecipients(Map<String, RecipientSnapshot> recipients) {
        this.recipients = recipients;
    }

    public static class RecipientSnapshot {
        private String name;
        private String phone;
        private String line1;
        private String line2;
        private String line3;
        private String city;
        private String state;
        private Boolean sameAsAbove;
        private Boolean saveAddress;
        private String label;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getLine1() {
            return line1;
        }

        public void setLine1(String line1) {
            this.line1 = line1;
        }

        public String getLine2() {
            return line2;
        }

        public void setLine2(String line2) {
            this.line2 = line2;
        }

        public String getLine3() {
            return line3;
        }

        public void setLine3(String line3) {
            this.line3 = line3;
        }

        public String getCity() {
            return city;
        }

        public void setCity(String city) {
            this.city = city;
        }

        public String getState() {
            return state;
        }

        public void setState(String state) {
            this.state = state;
        }

        public Boolean getSameAsAbove() {
            return sameAsAbove;
        }

        public void setSameAsAbove(Boolean sameAsAbove) {
            this.sameAsAbove = sameAsAbove;
        }

        public Boolean getSaveAddress() {
            return saveAddress;
        }

        public void setSaveAddress(Boolean saveAddress) {
            this.saveAddress = saveAddress;
        }

        public String getLabel() {
            return label;
        }

        public void setLabel(String label) {
            this.label = label;
        }
    }
}

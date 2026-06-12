import { useMemo, useState } from "react";
import { useCart } from "../context/CartContext";
import "../styles/CheckoutPageStyleNew.css";
import { saveAddress } from "../data/api";
import { useAuth } from "../context/AuthContext";
export default function CheckoutPage() {
  const { items } = useCart();
  const { user, profile } = useAuth();
  const groupedItems = useMemo(() => {
    return items.reduce((groups, item) => {
      const key = item.deliveryPincode?.trim() || "No Pincode";

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(item);

      return groups;
    }, {});
  }, [items]);

  const [recipientData, setRecipientData] = useState({});
  const [errors, setErrors] = useState({});
  const orderTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptError, setReceiptError] = useState("");

  const updateRecipient = (pincode, field, value) => {
    setRecipientData((prev) => ({
      ...prev,
      [pincode]: {
        ...prev[pincode],
        [field]: value,
      },
    }));
  };
  const validateRecipient = (data = {}) => {
    const errors = {};

    if (!data.name?.trim()) {
      errors.name = "Recipient name is required";
    }

    if (!/^[6-9]\d{9}$/.test(data.phone || "")) {
      errors.phone = "Enter valid Indian mobile number";
    }

    if (!data.line1?.trim()) {
      errors.line1 = "Address Line 1 is required";
    }

    if (!data.line2?.trim()) {
      errors.line2 = "Address Line 2 is required";
    }
    if (data?.saveAddress && !data?.label?.trim()) {
      errors.label = "Address label is required";
    }
    console.log(` error ${JSON.stringify(errors)}`);
    return errors;
  };

  const areAllRecipientsComplete = () => {
    for (const pincode of Object.keys(groupedItems)) {
      const result = validateRecipient(recipientData[pincode] || {});
      console.log(`result ${result}`);
      if (Object.keys(result).length > 0) {
        return false;
      }
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!items.length) {
      alert("Cart is empty");
      return;
    }

    const validationErrors = {};

    for (const pincode of Object.keys(groupedItems)) {
      const result = validateRecipient(recipientData[pincode] || {});
      if (Object.keys(result).length > 0) {
        validationErrors[pincode] = result;
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      alert("Please complete all recipient details before placing order.");

      return;
    }
    if (!receiptFile) {
      setReceiptError("Kindly upload transaction receipt");

      return;
    }

    console.log("Ready to place order");
    console.log("recipientData =", recipientData);
    console.log("groupedItems =", groupedItems);
    alert("Validation successful");

    for (const pincode of Object.keys(recipientData)) {
      const recipient = recipientData[pincode];

      if (recipient.saveAddress) {
        await saveAddress(
          {
            customerId: profile.id,
            label: recipient.label,
            recipientName: recipient.name,
            recipientPhone: recipient.phone,
            line1: recipient.line1,
            line2: recipient.line2,
            line3: recipient.line3,
            pincode,
          },
          user.token,
        );
      }
    }
  };
  const isRecipientComplete = (data = {}) => {
    return (
      data.name?.trim() &&
      /^[6-9]\d{9}$/.test(data.phone || "") &&
      data.line1?.trim() &&
      data.line2?.trim()
    );
  };

  const isCheckoutReady = () => {
    const allRecipientsComplete = Object.keys(groupedItems).every((pincode) =>
      isRecipientComplete(recipientData[pincode] || {}),
    );
    console.log(
      `allRecipientsComplete  ${allRecipientsComplete} receiptFile ${receiptFile}`,
    );
    return allRecipientsComplete && receiptFile;
  };

  const handleSameAsAbove = (currentPincode, previousPincode, checked) => {
    if (!checked) {
      setRecipientData((prev) => ({
        ...prev,
        [currentPincode]: {
          sameAsAbove: false,
        },
      }));

      return;
    }

    const previousData = recipientData[previousPincode];

    setRecipientData((prev) => ({
      ...prev,
      [currentPincode]: {
        ...previousData,
        sameAsAbove: true,
      },
    }));
  };

  const handleReceiptUpload = (e) => {
    if (!areAllRecipientsComplete()) {
      setReceiptError("Complete recipient details first");
      return;
    }
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

    if (!allowedTypes.includes(file.type)) {
      setReceiptError("Only PNG and JPG files are allowed");

      setReceiptFile(null);

      return;
    }

    setReceiptError("");
    setReceiptFile(file);
  };

  const recipientsComplete = areAllRecipientsComplete();
  const checkoutReady = isCheckoutReady();

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>

      {Object.entries(groupedItems).map(([pincode, cartItems], index) => {
        const previousPincode = Object.keys(groupedItems)[index - 1];
        const copied = recipientData[pincode]?.sameAsAbove;
        const groupTotal = cartItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );

        return (
          <section key={pincode} className="checkout-section">
            <h3 className="checkout-pincode">Delivery Pincode: {pincode}</h3>

            <div className="recipient-card">
              {index > 0 && (
                <label className="same-as-above-row">
                  <input
                    type="checkbox"
                    checked={recipientData[pincode]?.sameAsAbove || false}
                    disabled={
                      !isRecipientComplete(recipientData[previousPincode])
                    }
                    onChange={(e) =>
                      handleSameAsAbove(
                        pincode,
                        previousPincode,
                        e.target.checked,
                      )
                    }
                  />
                  Same as previous recipient ({previousPincode})
                </label>
              )}
              <h4>Recipient Details</h4>

              <input
                placeholder="Recipient Name"
                disabled={copied}
                value={recipientData[pincode]?.name || ""}
                onChange={(e) =>
                  updateRecipient(pincode, "name", e.target.value)
                }
              />
              {errors[pincode]?.name && (
                <div className="field-error">{errors[pincode].name}</div>
              )}
              <input
                placeholder="Indian Mobile Number"
                disabled={copied}
                maxLength={10}
                value={recipientData[pincode]?.phone || ""}
                onChange={(e) =>
                  updateRecipient(
                    pincode,
                    "phone",
                    e.target.value.replace(/\D/g, ""),
                  )
                }
              />
              {errors[pincode]?.phone && (
                <div className="field-error">{errors[pincode].phone}</div>
              )}
              <input
                className="full-width"
                disabled={copied}
                placeholder="Address Line 1 (Flat / House No, Building)"
                value={recipientData[pincode]?.line1 || ""}
                onChange={(e) =>
                  updateRecipient(pincode, "line1", e.target.value)
                }
              />
              {errors[pincode]?.line1 && (
                <div className="field-error">{errors[pincode].line1}</div>
              )}
              <input
                className="full-width"
                disabled={copied}
                placeholder="Address Line 2 (Apartment, Area, Street)"
                value={recipientData[pincode]?.line2 || ""}
                onChange={(e) =>
                  updateRecipient(pincode, "line2", e.target.value)
                }
              />
              {errors[pincode]?.line2 && (
                <div className="field-error">{errors[pincode].line2}</div>
              )}
              <input
                className="full-width"
                disabled={copied}
                placeholder="Address Line 3 (Landmark)"
                value={recipientData[pincode]?.line3 || ""}
                onChange={(e) =>
                  updateRecipient(pincode, "line3", e.target.value)
                }
              />

              <label>
                <input
                  className="save-address-row"
                  disabled={copied}
                  type="checkbox"
                  checked={recipientData[pincode]?.saveAddress || false}
                  onChange={(e) =>
                    updateRecipient(pincode, "saveAddress", e.target.checked)
                  }
                />
                Save this address
              </label>
              {errors[pincode]?.label && (
                <div className="field-error">{errors[pincode].label}</div>
              )}
              {recipientData[pincode]?.saveAddress && (
                <input
                  placeholder="Address Label (Home, Office, Mom)"
                  value={recipientData[pincode]?.label || ""}
                  onChange={(e) =>
                    updateRecipient(pincode, "label", e.target.value)
                  }
                />
              )}
            </div>

            <div className="checkout-items">
              <h4>Items</h4>

              {cartItems.map((item) => (
                <div key={item.id} className="checkout-item-row">
                  <span>{item.name}</span>
                  <span>Qty: {item.quantity}</span>
                  <span>Rs. {item.price * item.quantity}</span>
                </div>
              ))}
              <div className="checkout-group-total">
                <span>Group Total</span>
                <span>₹{groupTotal}</span>
              </div>
            </div>
          </section>
        );
      })}
      <div className="checkout-order-total">
        <span>Order Total</span>
        <span>₹{orderTotal}</span>
      </div>
      <div
        className={`payment-section ${
          !recipientsComplete ? "payment-disabled" : ""
        }`}
      >
        {" "}
        <h3>Payment Details</h3>
        <div className="payment-card">
          <div className="qr-container">
            <img
              src="/dummy-qrCode.png"
              alt="Payment QR"
              className="payment-qr"
              height="90px"
              width="90px"
            />
          </div>

          <div className="payment-info">
            <div>
              <strong>PhonePe:</strong>
              yourphonepe@upi
            </div>

            <div>
              <strong>Google Pay:</strong>
              yourgpay@okaxis
            </div>

            <div>
              <strong>PayPal:</strong>
              payments@yourdomain.com
            </div>
          </div>
        </div>
        <div className="receipt-upload">
          <label>Upload Transaction Receipt *</label>

          <input
            type="file"
            accept=".png,.jpg,.jpeg"
            disabled={!recipientsComplete}
            onChange={handleReceiptUpload}
          />

          {receiptFile && (
            <div className="uploaded-file">Uploaded: {receiptFile.name}</div>
          )}

          {receiptError && <div className="field-error">{receiptError}</div>}
        </div>
      </div>
      <div className="checkout-footer">
        {!checkoutReady && (
          <div className="checkout-warning">
            Complete recipient details and upload payment receipt to enable
            Place Order.
          </div>
        )}
        <button
          className="place-order-btn"
          disabled={!checkoutReady}
          onClick={handlePlaceOrder}
        >
          Place Order
        </button>
      </div>
    </div>
  );
}

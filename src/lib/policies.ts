export const COMPANY = {
  name: "KARTS SOLUTIONS PRIVATE LIMITED",
  brand: "Karts",
  address: "H-219, Sector 63, Noida, Gautam Buddha Nagar, Uttar Pradesh - 201301",
  phone: "+91 92119-81023",
  email: "hello@karts.in",
  website: "https://karts.in",
};

export type PolicyContent = {
  title: string;
  intro: string;
  sections: Array<{ heading: string; body: string; bullets?: string[] }>;
};

export const policies: Record<string, PolicyContent> = {
  "return-policy": {
    title: "Return Policy",
    intro: `At ${COMPANY.brand}, we want you to be confident in every purchase — whether you are buying a fashion, footwear or accessory item. This Return Policy explains when and how you may return eligible products purchased from our online store.`,
    sections: [
      {
        heading: "1. Return window",
        body: "You may request a return within 7 (seven) calendar days from the date of delivery, as shown on your order confirmation / courier delivery record. Requests raised after this window may be declined unless the product is defective or we delivered an incorrect item.",
      },
      {
        heading: "2. Eligible products",
        body: "Returns are accepted for unused, unwashed, undamaged products sold as clothing, footwear and accessory products, when all of the following conditions are met:",
        bullets: [
          "The item is in original condition with all tags, labels, dust bags, and brand packaging intact.",
          "The product has not been used outdoors, soiled, scratched, or altered in any way.",
          "You provide the original invoice / order number and clear photos if we request them.",
          "The product matches the SKU and description of the item you ordered.",
        ],
      },
      {
        heading: "3. Non-returnable items",
        body: "For hygiene, safety and commercial reasons, the following are generally not eligible for return unless they arrive damaged or incorrect:",
        bullets: [
          "Personalised or custom-made items (if offered).",
          "Clearance / final-sale products marked as non-returnable at checkout.",
          "Products without original packaging, missing accessories, or with signs of use.",
          "Promotional freebies or samples (if any).",
        ],
      },
      {
        heading: "4. How to initiate a return",
        body: `Email ${COMPANY.email} or call ${COMPANY.phone} with your order number, product name, reason for return, and photos of the item and packaging. Our support team will respond within 1–2 business days with approval status and reverse pickup / self-ship instructions where applicable.`,
      },
      {
        heading: "5. Inspection & approval",
        body: "Once we receive the returned product, our warehouse team inspects it. Approved returns are processed under our Refund Policy. If the return is rejected (for example, due to use, missing tags, or incomplete packaging), we will inform you and may ship the item back at your cost.",
      },
      {
        heading: "6. Wrong / damaged / defective items",
        body: "If you receive a damaged, defective, or incorrect product, please contact us within 48 hours of delivery with unboxing photos/videos. We will arrange a replacement or return–refund as per stock availability, at no extra shipping cost to you in verified cases.",
      },
      {
        heading: "7. Company details",
        body: `Returns are handled by ${COMPANY.name}, ${COMPANY.address}. For any dispute relating to returns, Indian law applies and courts at Surat, Gujarat shall have jurisdiction.`,
      },
    ],
  },

  "refund-policy": {
    title: "Refund Policy",
    intro: `This Refund Policy describes how ${COMPANY.brand} processes refunds for cancelled orders, approved returns, failed deliveries, and payment-related issues on products such as clothing, footwear and accessory items purchased through our website.`,
    sections: [
      {
        heading: "1. When refunds are issued",
        body: "Refunds are initiated after we confirm one of the following:",
        bullets: [
          "Your return has been received and approved after inspection.",
          "Your order was cancelled before dispatch and payment was already captured.",
          "Payment was deducted but the order could not be confirmed / fulfilled.",
          "We could not deliver the order due to our operational failure (verified cases).",
        ],
      },
      {
        heading: "2. Online payments (Razorpay — UPI / Card / Netbanking)",
        body: "For prepaid orders, refunds are credited to the original payment method used at checkout. Once we approve the refund, bank/UPI settlement typically completes within 5–7 business days. Exact timing depends on your bank or UPI app and is outside our direct control after we initiate the refund with the payment gateway.",
      },
      {
        heading: "3. Cash on Delivery (COD) orders",
        body: "For COD purchases, there is no prepaid amount to reverse at the time of order. If a COD order is returned and approved, we will refund the product amount via UPI or bank transfer to the account details you share by email. Please allow 7–10 business days after approval for the transfer to reflect.",
      },
      {
        heading: "4. What is refunded",
        body: "Product price (after any coupon discount already applied) is refundable for approved returns/cancellations. Shipping charges are non-refundable except where the return is due to our error (wrong item shipped) or a verified manufacturing defect.",
      },
      {
        heading: "5. Partial refunds",
        body: "If an order contains multiple items and only some are returned, we refund only the approved returned products. Coupon discounts may be recalculated proportionally where applicable.",
      },
      {
        heading: "6. Failed / duplicate payments",
        body: `If your account was charged more than once for the same order, write to ${COMPANY.email} with payment screenshots and order ID. After verification with our payment partner, we will refund the duplicate amount to the original method.`,
      },
      {
        heading: "7. Communication",
        body: `Refund status updates are shared on your registered email. For help, contact ${COMPANY.email} or ${COMPANY.phone}. Operated by ${COMPANY.name}.`,
      },
    ],
  },

  "cancellation-policy": {
    title: "Cancellation Policy",
    intro: `We understand plans can change. This Cancellation Policy explains how customers of ${COMPANY.brand} can cancel orders for clothing, footwear and accessory products, and what happens after an order is packed or shipped.`,
    sections: [
      {
        heading: "1. Cancellation before dispatch",
        body: `You may request cancellation any time before the order is marked as shipped / handed over to the courier. Email ${COMPANY.email} or call ${COMPANY.phone} with your order ID and reason. Once our team confirms the order has not left the warehouse, we will cancel it.`,
      },
      {
        heading: "2. Prepaid cancellations",
        body: "If you paid online and cancellation is approved before dispatch, a full refund of the paid amount (including shipping, if charged) will be initiated as per our Refund Policy.",
      },
      {
        heading: "3. COD cancellations",
        body: "COD orders cancelled before dispatch are simply closed in our system. No payment is collected. Repeated frivolous COD cancellations may lead to future COD restriction on your account to protect our fulfilment partners.",
      },
      {
        heading: "4. After dispatch",
        body: "Once an order is shipped, it cannot be cancelled through the website. You may:",
        bullets: [
          "Refuse delivery at the doorstep (where the courier allows), after which the parcel returns to us and we process as per return inspection rules; or",
          "Accept delivery and raise a return request within the return window under our Return Policy.",
        ],
      },
      {
        heading: "5. Our right to cancel",
        body: "We may cancel an order if the product is out of stock, pricing/listing error is detected, payment is incomplete or fraudulent, or delivery is not possible to your address/pincode. In such cases, any amount paid will be refunded.",
      },
      {
        heading: "6. Order status",
        body: "You can track order status from your Profile / Account page after logging in. For urgent cancellations, contact us as early as possible — once packing and courier handover begin, cancellation options reduce.",
      },
    ],
  },

  "shipping-delivery-policy": {
    title: "Shipping & Delivery Policy",
    intro: `${COMPANY.brand} ships carefully packed clothing, footwear and accessory products across India. This policy explains dispatch timelines, delivery estimates, shipping charges, and what to do if a shipment is delayed or damaged.`,
    sections: [
      {
        heading: "1. Serviceable locations",
        body: "We deliver to most pin codes across India through trusted courier and logistics partners. Some remote, restricted, or high-risk locations may have limited service, longer timelines, or COD restrictions. Serviceability is confirmed at checkout / fulfilment.",
      },
      {
        heading: "2. Order processing & dispatch",
        body: "Orders are usually processed and dispatched within 1–3 business days after confirmation (excluding Sundays and public holidays). During sales or high-demand periods, dispatch may take slightly longer. You will receive shipment updates on email / SMS where available.",
      },
      {
        heading: "3. Delivery timelines",
        body: "After dispatch, standard delivery typically takes 3–7 business days depending on your city and pin code. Metro and Tier-1 cities are often faster; remote areas may take 7–10 business days. These are estimated timelines, not guaranteed delivery dates.",
      },
      {
        heading: "4. Shipping charges",
        body: "Any shipping fee applicable to your order is shown clearly at checkout before you place the order. Promotional free-shipping offers, if live, will also be reflected at checkout.",
      },
      {
        heading: "5. Packaging",
        body: "Products are packed securely to protect against leakage, breakage and damage in transit, especially glass bottles and pump packaging. Please inspect the outer carton on delivery and note visible damage with the courier before accepting, wherever possible.",
      },
      {
        heading: "6. Failed delivery attempts",
        body: "Couriers usually attempt delivery more than once. If delivery fails due to incorrect address, unreachable phone number, or repeated non-availability, the shipment may return to us. Re-shipping may attract additional charges.",
      },
      {
        heading: "7. Damaged / missing parcels",
        body: `If the parcel arrives damaged or contents are missing, contact ${COMPANY.email} within 48 hours with photos of the package and product. We will coordinate with the logistics partner and arrange a suitable resolution.`,
      },
      {
        heading: "8. Contact",
        body: `${COMPANY.name}, ${COMPANY.address}. Phone: ${COMPANY.phone}. Email: ${COMPANY.email}.`,
      },
    ],
  },

  "privacy-policy": {
    title: "Privacy Policy",
    intro: `This Privacy Policy explains how ${COMPANY.name} (“we”, “us”, “${COMPANY.brand}”) collects, uses, stores and protects your personal information when you browse our website, create an account, place an order for fashion, footwear or accessory products, or contact our support team. We are committed to handling your data responsibly in line with applicable Indian laws including the Information Technology Act, 2000 and related rules.`,
    sections: [
      {
        heading: "1. Information we collect",
        body: "Depending on how you use Karts, we may collect:",
        bullets: [
          "Identity & contact details: name, email address, phone number, shipping/billing address.",
          "Account data: login credentials (stored as a secure password hash), order history.",
          "Transaction data: products purchased, amounts, payment method type (COD / online), payment status.",
          "Technical data: browser type, device information, IP address, and basic analytics cookies needed to run the site.",
          "Communications: messages you send via contact forms, email, or phone.",
        ],
      },
      {
        heading: "2. How we use your information",
        body: "We use your information to:",
        bullets: [
          "Process, fulfil and deliver orders of clothing, footwear and accessory products.",
          "Send order confirmations, shipping updates and customer support replies.",
          "Operate login sessions and protect accounts against unauthorised access.",
          "Improve website performance, product catalogue and user experience.",
          "Comply with legal, tax, accounting and fraud-prevention requirements.",
        ],
      },
      {
        heading: "3. Legal basis / consent",
        body: "By creating an account, placing an order, or submitting a contact form, you consent to processing of your information for the purposes described in this policy. You may withdraw consent for marketing communications at any time by writing to us (transactional emails related to orders may still be sent).",
      },
      {
        heading: "4. Sharing of information",
        body: "We do not sell your personal information. We may share limited data with:",
        bullets: [
          "Logistics / courier partners — to deliver your order.",
          "Payment gateways (e.g. Razorpay) — to process online payments securely.",
          "IT / hosting providers — to operate our website and databases.",
          "Authorities — when required by law or to protect our legal rights.",
        ],
      },
      {
        heading: "5. Cookies & similar technologies",
        body: "We use essential cookies for session login and cart continuity. We may use limited analytics to understand traffic patterns. You can control cookies through your browser settings; disabling essential cookies may affect login and checkout.",
      },
      {
        heading: "6. Data security & retention",
        body: "We use reasonable technical and organisational measures (including encrypted session cookies and hashed passwords) to protect your data. Order and account records are retained as long as needed for business, legal and tax purposes, then deleted or anonymised where practicable.",
      },
      {
        heading: "7. Your rights",
        body: `You may request access, correction, or deletion of your personal data (subject to legal retention needs) by emailing ${COMPANY.email}. We may need to verify your identity before processing such requests.`,
      },
      {
        heading: "8. Children’s privacy",
        body: "Our store is intended for users aged 18+. We do not knowingly collect personal information from children. If you believe a minor has provided data, contact us for removal.",
      },
      {
        heading: "9. Grievance / contact",
        body: `For privacy concerns, contact: ${COMPANY.email} | ${COMPANY.phone}. Postal address: ${COMPANY.name}, ${COMPANY.address}.`,
      },
    ],
  },

  "terms-of-use": {
    title: "Terms of Use",
    intro: `Welcome to ${COMPANY.brand}. These Terms of Use (“Terms”) govern your access to and use of our website, mobile browsing experience, and purchase of products including clothing, footwear and accessory items. By using the site, you agree to these Terms. If you do not agree, please do not use the website.`,
    sections: [
      {
        heading: "1. About the seller",
        body: `The website is operated by ${COMPANY.name}, registered address: ${COMPANY.address}. Contact: ${COMPANY.email}, ${COMPANY.phone}.`,
      },
      {
        heading: "2. Eligibility",
        body: "You must be at least 18 years old and capable of entering into a binding contract under Indian law to place orders. By placing an order, you represent that the information you provide is accurate and complete.",
      },
      {
        heading: "3. Products & pricing",
        body: "We aim to display accurate product titles, descriptions, images and INR prices. Minor variations in colour, texture or finish may occur due to screen settings or manufacturer batches. Prices and offers may change without prior notice. In case of an obvious pricing error, we reserve the right to cancel the order and refund any amount paid.",
      },
      {
        heading: "4. Orders & acceptance",
        body: "An order placed on the website is an offer to buy. Order confirmation email does not always mean final acceptance — acceptance occurs when we confirm fulfilment / dispatch. We may refuse or cancel orders for stock unavailability, suspected fraud, or serviceability issues.",
      },
      {
        heading: "5. Payments",
        body: "We accept Cash on Delivery (where available) and online payments via supported gateways (UPI, cards, netbanking). Online payment processing is handled by third-party providers; we do not store full card details on our servers.",
      },
      {
        heading: "6. User accounts",
        body: "You are responsible for keeping your login credentials confidential and for all activity under your account. Notify us immediately of any unauthorised use. We may suspend accounts that violate these Terms or engage in abuse (including repeated false COD refusals).",
      },
      {
        heading: "7. Intellectual property",
        body: "All website content — logos, text, graphics, product photography and design — is owned by or licensed to us. You may not copy, scrape, or commercially reuse content without written permission.",
      },
      {
        heading: "8. Prohibited use",
        body: "You agree not to misuse the site, attempt unauthorised access, interfere with security, post unlawful content, or use the platform for fraudulent transactions.",
      },
      {
        heading: "9. Limitation of liability",
        body: "To the fullest extent permitted by law, our liability for any claim arising from a product or the website is limited to the amount you paid for the relevant order. We are not liable for indirect, incidental or consequential losses (including delay by courier partners beyond reasonable control).",
      },
      {
        heading: "10. Linked policies",
        body: "Your purchases are also governed by our Return, Refund, Cancellation, Shipping & Delivery and Privacy policies published on this website. Those policies form part of these Terms by reference.",
      },
      {
        heading: "11. Governing law & jurisdiction",
        body: "These Terms are governed by the laws of India. Exclusive jurisdiction lies with the competent courts at Surat, Gujarat, without prejudice to any rights you may have under applicable consumer protection laws.",
      },
      {
        heading: "12. Changes to Terms",
        body: "We may update these Terms from time to time. Continued use of the website after changes constitutes acceptance of the revised Terms. The “Last updated” date on this page reflects the latest revision.",
      },
    ],
  },
};

import { Question } from '../types/competition';

export const round3Question: Question = {
  id: 'r3-q1',
  round: 3,
  number: 1,
  title: 'Smart Restaurant Billing & Order Dispatch System',
  description: `You are tasked with rescuing the core dispatch engine for an omnichannel restaurant POS system: the **Smart Restaurant Billing & Order Dispatch System**.

The system receives a customer order consisting of menu items, validates item pricing against the menu catalog, calculates loyalty tier and coupon discounts, determines state GST (5%) and distance-based delivery fees, and produces a finalized order invoice.

The legacy code has been streamlined into two pipeline functions, but contains **exactly 10 critical bugs**:
- **Bug 1 (Lookup)**: Unchecked dictionary lookup raises fatal \`KeyError\` on unrecognized menu items.
- **Bug 2 (Arithmetic)**: Line item totals computed using addition (\`price + qty\`) instead of multiplication.
- **Bug 3 (Case Sensitivity)**: Membership tier compares raw lowercase \`tier == "gold"\`, failing on uppercase \`"GOLD"\`.
- **Bug 4 (Rate Typo)**: Silver membership discount contains a decimal typo (\`0.50\` = 50% instead of \`0.05\` = 5%).
- **Bug 5 (Pricing Sign)**: Discount amount is added to the subtotal instead of subtracted.
- **Bug 6 (Type Floor)**: GST evaluated using integer floor division \`(5 // 100)\`, yielding zero tax.
- **Bug 7 (Delivery Slabs)**: Overage distance ignores the base fee of ₹30 for the initial 3 km.
- **Bug 8 (Total Sign)**: Logistics delivery fee is subtracted from the invoice instead of added.
- **Bug 9 (Inverted Logic)**: Order confirmation status flags \`"REJECTED"\` when the payable amount is positive.
- **Bug 10 (Payload Key)**: Output invoice dictionary omits the mandatory identification field \`"order_id"\`.

### Mission: Rescue the Code!
Locate all 10 bugs in the 38 lines of code, repair the system, verify all test suites, and submit before the 25-minute countdown finishes!`,
  difficulty: 'Advanced',
  language: 'python',
  bugType: 'Multiple Issues',
  brokenCode: `# FUNCTION 1: ITEM TOTALS & PROMO PRICING (Bugs 1 to 5)
def calculate_discounted_bill(order_items, menu_catalog, tier, coupon):
    subtotal = 0.0
    errors = []
    for item in order_items:
        name, qty = item.get("name"), item.get("qty", 0)
        # BUG 1: unhandled KeyError on unknown menu item (missing 'in' check)
        price = menu_catalog[name]
        if qty <= 0:
            errors.append(f"Invalid qty for {name}")
            continue
        # BUG 2: adds price + qty instead of multiplying
        subtotal += price + qty

    # BUG 3: strict lowercase comparison fails on uppercase 'GOLD'
    # BUG 4: silver rate typo 0.50 (50%) instead of 0.05
    rate = 0.20 if tier == "platinum" else (0.15 if tier == "gold" else (0.50 if tier.lower() == "silver" else 0.0))
    discount = subtotal * rate
    if coupon == "FEAST50" and subtotal >= 300:
        discount += 50.0
    discount = min(discount, subtotal * 0.50)
    
    # BUG 5: adds discount to subtotal instead of subtracting
    discounted_amount = subtotal + discount
    return {"subtotal": round(subtotal, 2), "discount": round(discount, 2), 
            "discounted_amount": round(discounted_amount, 2), "errors": errors}

# FUNCTION 2: INVOICE LOGISTICS & GRAND TOTAL (Bugs 6 to 10)
def generate_order_invoice(order_id, order_items, menu_catalog, tier, coupon, distance_km):
    bill = calculate_discounted_bill(order_items, menu_catalog, tier, coupon)
    net = bill["discounted_amount"]
    if bill["subtotal"] == 0:
        return {"order_id": order_id, "status": "REJECTED"}

    # BUG 6: integer division (5 // 100) results in 0.0 GST
    gst = round(net * (5 // 100), 2)
    # BUG 7: overage ignores base slab of Rs 30 for first 3 km
    delivery = 0.0 if distance_km <= 0 else (30.0 if distance_km <= 3.0 else distance_km * 10.0)

    # BUG 8: subtracts delivery fee from total instead of adding
    grand_total = net + gst - delivery
    # BUG 9: inverted status: sets REJECTED when grand_total > 0
    status = "REJECTED" if grand_total > 0 else "CONFIRMED"

    # BUG 10: missing 'order_id' key in invoice payload
    return {
        "subtotal": bill["subtotal"],
        "discount": bill["discount"],
        "gst": gst,
        "delivery_fee": round(delivery, 2),
        "grand_total": round(grand_total, 2),
        "status": status
    }

menu = {"Burger": 150.0, "Pizza": 250.0}
items = [{"name": "Burger", "qty": 2}, {"name": "Pizza", "qty": 1}]
print(generate_order_invoice("ORD-1001", items, menu, "GOLD", "FEAST50", 5.5))`,
  solutionCode: `def calculate_discounted_bill(order_items, menu_catalog, tier, coupon):
    subtotal = 0.0
    errors = []
    for item in order_items:
        name, qty = item.get("name"), item.get("qty", 0)
        if name not in menu_catalog:
            errors.append(f"Item not found: {name}")
            continue
        if qty <= 0:
            errors.append(f"Invalid qty for {name}")
            continue
        subtotal += menu_catalog[name] * qty

    t = tier.upper() if tier else "BRONZE"
    rate = 0.20 if t == "PLATINUM" else (0.15 if t == "GOLD" else (0.05 if t == "SILVER" else 0.0))
    discount = subtotal * rate
    if coupon == "FEAST50" and subtotal >= 300:
        discount += 50.0
    discount = min(discount, subtotal * 0.50)
    discounted_amount = subtotal - discount
    return {"subtotal": round(subtotal, 2), "discount": round(discount, 2), 
            "discounted_amount": round(discounted_amount, 2), "errors": errors}

def generate_order_invoice(order_id, order_items, menu_catalog, tier, coupon, distance_km):
    bill = calculate_discounted_bill(order_items, menu_catalog, tier, coupon)
    if bill["subtotal"] == 0:
        return {"order_id": order_id, "status": "REJECTED"}

    net = bill["discounted_amount"]
    gst = round(net * 0.05, 2)
    delivery = 0.0 if distance_km <= 0 else (30.0 if distance_km <= 3.0 else 30.0 + (distance_km - 3.0) * 10.0)

    grand_total = net + gst + delivery
    status = "CONFIRMED" if grand_total > 0 else "REJECTED"

    return {
        "order_id": order_id,
        "subtotal": bill["subtotal"],
        "discount": bill["discount"],
        "gst": gst,
        "delivery_fee": round(delivery, 2),
        "grand_total": round(grand_total, 2),
        "status": status
    }

menu = {"Burger": 150.0, "Pizza": 250.0}
items = [{"name": "Burger", "qty": 2}, {"name": "Pizza", "qty": 1}]
print(generate_order_invoice("ORD-1001", items, menu, "GOLD", "FEAST50", 5.5))`,
  expectedBehavior: 'Correctly check unknown items, multiply price * qty, normalize tier uppercase, fix silver 0.05, subtract discount, compute 5% GST, base 30+10*(dist-3) delivery, add delivery to total, set CONFIRMED when total > 0, and include order_id.',
  inputFormat: 'order_id: str, order_items: list[dict], menu_catalog: dict, tier: str, coupon: str, distance_km: float',
  outputFormat: 'Dictionary: {"order_id": str, "subtotal": float, "discount": float, "gst": float, "delivery_fee": float, "grand_total": float, "status": str}',
  constraints: [
    'order_items contains items with name and qty',
    'menu_catalog maps valid names to float prices',
    'distance_km >= 0'
  ],
  hints: 'Check menu_catalog membership before lookup, multiply price * qty, tier.upper(), silver rate 0.05, subtotal - discount, net * 0.05, 30 + (dist - 3) * 10, add delivery, status CONFIRMED, and return order_id.',
  points: 5,
  visibleTests: [
    {
      id: 'r3-t1',
      input: '"ORD-1001", [{"name": "Burger", "qty": 2}, {"name": "Pizza", "qty": 1}], {"Burger": 150.0, "Pizza": 250.0}, "GOLD", "FEAST50", 5.5',
      expectedOutput: "{'order_id': 'ORD-1001', 'subtotal': 550.0, 'discount': 132.5, 'gst': 20.88, 'delivery_fee': 55.0, 'grand_total': 493.38, 'status': 'CONFIRMED'}",
      description: 'Standard multi-item gold tier delivery order'
    },
    {
      id: 'r3-t2',
      input: '"ORD-1002", [{"name": "Burger", "qty": 1}], {"Burger": 150.0}, "SILVER", "NONE", 2.0',
      expectedOutput: "{'order_id': 'ORD-1002', 'subtotal': 150.0, 'discount': 7.5, 'gst': 7.12, 'delivery_fee': 30.0, 'grand_total': 179.62, 'status': 'CONFIRMED'}",
      description: 'Silver tier short distance delivery'
    }
  ],
  hiddenTests: [
    {
      id: 'r3-h1',
      input: '"ORD-1003", [{"name": "MysteryItem", "qty": 1}], {"Burger": 150.0}, "BRONZE", "NONE", 0.0',
      expectedOutput: "{'order_id': 'ORD-1003', 'status': 'REJECTED'}",
      description: 'Unlisted menu item unhandled KeyError check'
    },
    {
      id: 'r3-h2',
      input: '"ORD-1004", [{"name": "Pizza", "qty": 2}], {"Pizza": 250.0}, "PLATINUM", "FEAST50", 0.0',
      expectedOutput: "{'order_id': 'ORD-1004', 'subtotal': 500.0, 'discount': 150.0, 'gst': 17.5, 'delivery_fee': 0.0, 'grand_total': 367.5, 'status': 'CONFIRMED'}",
      description: 'Pickup order (0km) platinum discount'
    },
    {
      id: 'r3-h3',
      input: '"ORD-1005", [{"name": "Juice", "qty": 0}], {"Juice": 50.0}, "BRONZE", "NONE", 1.0',
      expectedOutput: "{'order_id': 'ORD-1005', 'status': 'REJECTED'}",
      description: 'Zero quantity order rejected'
    }
  ]
};

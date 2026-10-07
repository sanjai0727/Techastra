"""
Automated validation harness for the 16 Code Rescue competition questions:
- Round 1: 10 Questions (2 bugs each)
- Round 2: 5 Questions (5 bugs each)
- Round 3: 1 Integrated System (10 bugs total across 4 modules)
"""

def test_round1():
    print("Testing Round 1 Questions...")
    # Q1: Student average
    def q1(marks):
        if not marks: return 0.0
        return round(sum(marks) / len(marks), 2)
    assert q1([78, 85, 92, 88]) == 85.75
    assert q1([100, 90]) == 95.0

    # Q2: Palindrome
    def q2(text):
        cleaned = text.lower()
        return cleaned == cleaned[::-1]
    assert q2("Racecar") is True
    assert q2("Python") is False

    # Q3: Discount
    def q3(price, pct):
        return round(price - (price * pct / 100.0), 2)
    assert q3(1200.0, 15.0) == 1020.0
    assert q3(500.0, 10.0) == 450.0

    # Q4: Find maximum
    def q4(nums):
        return max(nums)
    assert q4([-12, -5, -20, -3]) == -3
    assert q4([10, 45, 23]) == 45

    # Q5: Count evens
    def q5(nums):
        return sum(1 for n in nums if n % 2 == 0)
    assert q5([1, 2, 3, 4, 6, 7]) == 3

    # Q6: Celsius to fahrenheit
    def q6(c):
        return round((c * 9.0 / 5.0) + 32, 2)
    assert q6(25.0) == 77.0
    assert q6(0.0) == 32.0

    # Q7: Word frequency
    def q7(words):
        freq = {}
        for w in words:
            cl = w.lower()
            freq[cl] = freq.get(cl, 0) + 1
        return freq
    assert q7(["apple", "Banana", "APPLE", "banana", "apple"]) == {"apple": 3, "banana": 2}

    # Q8: Factorial
    def q8(n):
        f = 1
        for i in range(1, n + 1): f *= i
        return f
    assert q8(5) == 120
    assert q8(0) == 1

    # Q9: Reverse sublist
    def q9(lst, start, end):
        return lst[:start] + lst[start:end+1][::-1] + lst[end+1:]
    assert q9([1, 2, 3, 4, 5, 6], 1, 4) == [1, 5, 4, 3, 2, 6]

    # Q10: Count vowels
    def q10(t):
        return sum(1 for c in t if c in "aeiouAEIOU")
    assert q10("Education") == 5
    assert q10("rhythm") == 0
    print("  All 10 Round 1 questions PASSED!")

def test_round2():
    print("Testing Round 2 Questions...")
    # Q1: Electricity bill
    def q1(units, m_type):
        if units <= 100: e = units * 2.0
        elif units <= 200: e = 100*2.0 + (units - 100)*3.5
        elif units <= 400: e = 100*2.0 + 100*3.5 + (units - 200)*5.0
        else: e = 100*2.0 + 100*3.5 + 200*5.0 + (units - 400)*7.0
        surch = e * 0.05 if e > 1500 else 0.0
        fix = 150.0 if m_type.lower() == 'commercial' else 50.0
        return round(e + surch + fix, 2)
    assert q1(250, "domestic") == 850.0
    assert q1(500, "commercial") == 2512.5

    # Q2: Student evaluation
    def q2(marks):
        tot = sum(marks)
        avg = round(tot / len(marks), 2)
        failed = any(m < 40 for m in marks)
        dist_count = sum(1 for m in marks if m >= 75)
        if failed:
            status, grade = "FAIL", "F"
        else:
            status = "PASS"
            if avg >= 90: grade = "A+"
            elif avg >= 80: grade = "A"
            elif avg >= 70: grade = "B"
            elif avg >= 50: grade = "C"
            else: grade = "D"
        return {"total": tot, "average": avg, "status": status, "grade": grade, "distinction_count": dist_count}
    res2 = q2([85, 92, 78, 65, 88])
    assert res2 == {'total': 408, 'average': 81.6, 'status': 'PASS', 'grade': 'A', 'distinction_count': 4}

    # Q3: Cart checkout
    def q3(items, coupon, is_member):
        sub = sum(it["price"] * it["quantity"] for it in items if it.get("quantity", 0) > 0)
        disc = 0.0
        if coupon == "SAVE20": disc = sub * 0.20 if sub >= 2000 else sub * 0.10
        elif coupon == "SAVE10": disc = sub * 0.10
        if is_member and sub > 0: disc += 100.0
        disc = min(disc, sub)
        net = sub - disc
        tax = round(net * 0.05, 2)
        ship = 0.0 if (net >= 500.0 or net == 0.0) else 50.0
        return {"subtotal": round(sub, 2), "discount": round(disc, 2), "tax": round(tax, 2), "shipping": round(ship, 2), "final_total": round(net + tax + ship, 2)}
    res3 = q3([{'price': 800, 'quantity': 2}, {'price': 300, 'quantity': 1}], "SAVE10", True)
    assert res3["subtotal"] == 1900.0
    assert res3["discount"] == 290.0
    assert res3["final_total"] == 1690.5

    # Q4: Matrix boundary
    def q4(m):
        n = len(m)
        main_d = sum(m[i][i] for i in range(n))
        sec_d = sum(m[i][n - i - 1] for i in range(n))
        b = sum(m[r][c] for r in range(n) for c in range(n) if r == 0 or r == n - 1 or c == 0 or c == n - 1)
        return {"main_diag": main_d, "sec_diag": sec_d, "boundary": b}
    res4 = q4([[1,2,3],[4,5,6],[7,8,9]])
    assert res4 == {'main_diag': 15, 'sec_diag': 15, 'boundary': 40}

    # Q5: Credentials validation
    def q5(pw, tk):
        pw_ok = 8 <= len(pw) <= 20 and any(c.isupper() for c in pw) and any(c.islower() for c in pw) and any(c.isdigit() for c in pw) and any(c in "!@#$%^&*" for c in pw) and ' ' not in pw
        tk_ok = tk.startswith("TK-") and len(tk) == 8 and all(c in "0123456789abcdefABCDEF" for c in tk[3:])
        return {"password_valid": pw_ok, "token_valid": tk_ok, "is_authorized": pw_ok and tk_ok}
    res5 = q5("Secure@Pass123", "TK-4F2A1")
    assert res5["is_authorized"] is True
    print("  All 5 Round 2 questions PASSED!")

def test_round3():
    print("Testing Round 3 Flagship System...")
    def item_totals(order_items, menu):
        sub = 0.0
        val = []
        err = []
        for it in order_items:
            name, qty = it.get("item"), it.get("qty", 0)
            if name not in menu: err.append(f"Not found: {name}"); continue
            if qty <= 0: err.append(f"Invalid qty: {name}"); continue
            tot = menu[name] * qty
            sub += tot
            val.append({"item": name, "qty": qty, "total": tot})
        return {"subtotal": sub, "valid_items": val, "errors": err}

    def tier_disc(sub, tier, coupon):
        t = tier.upper() if tier else "BRONZE"
        rates = {"PLATINUM": 0.20, "GOLD": 0.15, "SILVER": 0.05}
        d = sub * rates.get(t, 0.0)
        if coupon == "FEAST50" and sub >= 300: d += 50.0
        d = min(d, sub * 0.50)
        return {"discount": round(d, 2), "discounted_subtotal": round(sub - d, 2)}

    def tax_del(amount, dist):
        gst = round(amount * 0.05, 2)
        if dist <= 0: fee = 0.0
        elif dist <= 3.0: fee = 30.0
        else: fee = 30.0 + (dist - 3.0) * 10.0
        return {"gst": gst, "delivery_fee": round(fee, 2)}

    def process_order(oid, items, menu, tier, coupon, dist):
        res1 = item_totals(items, menu)
        if res1["subtotal"] == 0: return {"order_id": oid, "status": "REJECTED"}
        res2 = tier_disc(res1["subtotal"], tier, coupon)
        res3 = tax_del(res2["discounted_subtotal"], dist)
        grand = res2["discounted_subtotal"] + res3["gst"] + res3["delivery_fee"]
        return {
            "order_id": oid,
            "subtotal": round(res1["subtotal"], 2),
            "discount": res2["discount"],
            "gst": res3["gst"],
            "delivery_fee": res3["delivery_fee"],
            "grand_total": round(grand, 2),
            "status": "CONFIRMED" if grand > 0 else "REJECTED"
        }

    menu = {"Burger": 150.0, "Pizza": 250.0}
    items = [{"item": "Burger", "qty": 2}, {"item": "Pizza", "qty": 1}]
    out = process_order("ORD-1001", items, menu, "GOLD", "FEAST50", 5.5)
    assert out["subtotal"] == 550.0
    assert out["discount"] == 132.50
    assert out["gst"] == 20.88
    assert out["delivery_fee"] == 55.00
    assert out["grand_total"] == 493.38
    assert out["status"] == "CONFIRMED"
    print("  Round 3 Flagship System PASSED perfectly!")

if __name__ == "__main__":
    test_round1()
    test_round2()
    test_round3()
    print("ALL 16 QUESTIONS VERIFIED AND 100% CORRECT!")

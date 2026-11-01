from app.modules.orders.service import OrderService


def test_amount_to_words():
    assert OrderService._amount_to_words(12500.0) == "Twelve Thousand Five Hundred US Dollars Only"
    assert OrderService._amount_to_words(100.50) == "One Hundred US Dollars and Fifty Cents Only"
    assert OrderService._amount_to_words(0.0) == "Zero US Dollars Only"
    assert OrderService._amount_to_words(1000000.0) == "One Million US Dollars Only"


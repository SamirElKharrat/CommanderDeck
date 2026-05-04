from pyedhrec import EDHRec

cards = []
edhrec = EDHRec()
avg_deck = edhrec.get_commanders_average_deck("Sauron, The Dark Lord", "budget")


card = avg_deck["decklist"][0].split(" ", 1)[1]
card_details = edhrec.get_card_details(card)
print(card_details)


for card in avg_deck["decklist"]:
    quantity = card.split(" ", 1)[0]
    card = card.split(" ", 1)[1]
    try:
        card_details = edhrec.get_card_details(card)
    except:
        continue
    cards.append({
    "name": card_details.get("name", ""),
    "quantity": quantity,
    "details": card_details.get("oracle_text", ""),
    "type": card_details.get("type", ""),
    "mana_cost": card_details.get("mana_cost", ""),
    "version": card_details.get("unique_artwork", [{}])[0].get("image_uris", [""])[0]
    })



print(cards)



import sqlite3

def main():
    conn = sqlite3.connect('commander_deck.db')
    cursor = conn.cursor()
    
    # Update all empty owner_usernames in decks with the correct username from users
    cursor.execute('''
        UPDATE decks
        SET owner_username = (
            SELECT user_name 
            FROM users 
            WHERE users.id = decks.user_id
        )
        WHERE owner_username = '' OR owner_username IS NULL
    ''')
    
    conn.commit()
    print(f"Updated {cursor.rowcount} decks.")
    conn.close()

if __name__ == '__main__':
    main()

""" DB interaction """
import psycopg2
from .constants import *


def connect_db():
    """ Connect to db """
    return psycopg2.connect(
        host=HOST,
        database=DATABASE,
        user=USER,
        password=PASSWORD
    )


def create_tables():
    """ creates initial tables """
    commands = (
        """
        CREATE TABLE IF NOT EXISTS contract (
           id serial PRIMARY KEY NOT NULL,
           address VARCHAR NOT NULL,
           abi VARCHAR NOT NULL
        )
        """,
        """ CREATE TABLE IF NOT EXISTS message (
           id serial PRIMARY KEY NOT NULL,
           recvAddress VARCHAR(255) NOT NULL,
           sendAddress VARCHAR(255) NOT NULL,
           recvName VARCHAR(255) NOT NULL,
           sendName VARCHAR(255) NOT NULL,
           timestamp VARCHAR(255) NOT NULL,
           recvContents VARCHAR NOT NULL,
           sendContents VARCHAR NOT NULL
           )
        """)
    conn = None
    try:
        conn = connect_db()
        cur = conn.cursor()

        # create tables
        for command in commands:
            cur.execute(command)

        # close communication with the db
        cur.close()

        # commit the changes
        conn.commit()

    except Exception as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()


def get_contacts(address):
    """ returns list of users that had interacted with address """
    conn = connect_db()
    cur = conn.cursor()

    cur.execute(
        "SELECT DISTINCT recvAddress,recvName FROM message WHERE (sendAddress=%s) "
        "UNION "
        "SELECT DISTINCT sendAddress, sendName FROM message WHERE (recvAddress=%s);",
        (address, address,))
    res = []
    for row in cur:
        res.append(row)

    cur.close()
    conn.close()
    return res


def get_contract():
    """ return contract info  from db """
    conn = connect_db()
    cur = conn.cursor()

    cur.execute("SELECT * FROM contract;")
    res = cur.fetchone()

    cur.close()
    conn.close()
    return res


def set_contract(address, abi):
    """ stores contract info to db """
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("DROP TABLE contract")
    conn.commit()
    create_tables()
    cur.execute("INSERT INTO contract (address, abi) VALUES (%s, %s);", (address, abi))
    conn.commit()
    cur.close()
    conn.close()


def get_messages(receive_address, send_address, offset, count):
    """ return most recent messages from offset to count from both communicators """
    conn = connect_db()
    cur = conn.cursor()
    cur.execute(
        "(SELECT * FROM message WHERE (recvAddress=%s AND sendAddress=%s) ORDER by id DESC LIMIT %s OFFSET %s) "
        "UNION "
        "(SELECT * FROM message WHERE (recvAddress=%s AND sendAddress=%s) ORDER by id DESC LIMIT %s OFFSET %s) "
        "ORDER by id;",
        (receive_address, send_address, count, offset, send_address, receive_address, count, offset))
    res = []
    for row in cur:
        res.append(row)
    cur.close()
    conn.close()
    return res


def set_message(recv_address, send_address, recv_name, send_name, timestamp, recv_contents, send_contents):
    """ save message to db """
    conn = connect_db()
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO message (recvAddress, sendAddress, recvName, sendName, timestamp, recvContents, sendContents) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s)",
        (recv_address, send_address, recv_name, send_name, timestamp, recv_contents, send_contents,))
    conn.commit()
    cur.close()
    conn.close()


def drop_users():
    """ removes all messages from db """
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("DROP TABLE message")
    conn.commit()
    create_tables()

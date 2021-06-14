import psycopg2, constants

def connectDB():
   return psycopg2.connect(
         host=constants.HOST, database=constants.DATABASE, user=constants.USER, password=constants.PASSWORD
      )


#creates initila tables
def createTables():
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
      conn = connectDB()
      cur = conn.cursor()

      # create tables
      for command in commands:
         cur.execute(command)

      # close communication with the db
      cur.close()

      # commit the changes
      conn.commit()

   except (Exception, psycopg2.DatabaseError) as error:
        print(error)
   finally:
      if conn is not None:
         conn.close()

# returns list of users that had interacted with address
def getContacts(address):
   conn = connectDB()
   cur = conn.cursor()
   
   cur.execute("SELECT DISTINCT recvAddress,recvName FROM message WHERE (sendAddress=%s) UNION SELECT DISTINCT sendAddress,sendName FROM message WHERE (recvAddress=%s);",(address,address))
   res = []
   for row in cur:
      res.append(row)
   
   cur.close()
   conn.close()
   return res

#return contract info  from db
def getContract():
   conn = connectDB()
   cur = conn.cursor()
   
   cur.execute("SELECT * FROM contract;")
   res = cur.fetchone()
   
   cur.close()
   conn.close()
   return res
   
#stores contract info to db
def setContract(address, abi):
   conn = connectDB()
   cur = conn.cursor()
   cur.execute("DROP TABLE contract")
   conn.commit()
   createTables()
   cur.execute("INSERT INTO contract (address, abi) VALUES (%s, %s);", (address, abi))
   conn.commit()
   cur.close()
   conn.close()

#return all mesages between two addreses
def getMessages(raddress, saddress):
   conn = connectDB()
   cur = conn.cursor()
   cur.execute("SELECT * FROM message WHERE (recvAddress=%s AND sendAddress=%s) OR (recvAddress=%s AND sendAddress=%s);", (raddress, saddress, saddress, raddress))
   res = []
   for row in cur:
      res.append(row)
   cur.close()
   conn.close()
   return res

#save message to db
def setMessage(recvAddress, sendAddress, recvName, sendName, timestamp, recvContents, sendContents):
   conn = connectDB()
   cur = conn.cursor()
   
   cur.execute("INSERT INTO message (recvAddress, sendAddress, recvName, sendName, timestamp, recvContents, sendContents) VALUES (%s, %s, %s, %s, %s, %s, %s)", (recvAddress, sendAddress, recvName, sendName, timestamp, recvContents, sendContents))
   conn.commit()
   cur.close()
   conn.close()
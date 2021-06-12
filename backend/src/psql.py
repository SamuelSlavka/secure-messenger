import psycopg2

def connectDB():
   return psycopg2.connect(
         host='0.0.0.0', database='postgres', user='postgres', password="postgres"
      )

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
         contents VARCHAR NOT NULL
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

   query = "SELECT DISTINCT recvAddress,recvName FROM message WHERE sendAddress='"+address+"' UNION "+"SELECT DISTINCT sendAddress,sendName FROM message WHERE recvAddress='"+address+"';"
   cur.execute(query)
   res = []
   for row in cur:
      res.append(row)
   
   cur.close()
   conn.close()
   return res

def getContract():
   conn = connectDB()
   cur = conn.cursor()
   
   cur.execute("SELECT * FROM contract;")
   res = cur.fetchone()
   
   cur.close()
   conn.close()
   return res
   

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

def getMessages(raddress, saddress):
   conn = connectDB()
   cur = conn.cursor()
   cur.execute("SELECT * FROM message WHERE (recvAddress=%s AND sendAddress=%s) OR (sendAddress=%s AND recvAddress=%s) = %s", (raddress, saddress, raddress, saddress))
   res = []
   for row in cur:
      res.append(row)
   cur.close()
   conn.close()
   return res

def setMessage(recvAddress, sendAddress, recvName, sendName, timestamp, contents):
   conn = connectDB()
   cur = conn.cursor()
   
   cur.execute("INSERT INTO message (recvAddress, sendAddress, recvName, sendName, timestamp, contents) VALUES (%s, %s, %s, %s, %s, %s)", (recvAddress, sendAddress, recvName, sendName, timestamp, contents))
   conn.commit()
   cur.close()
   conn.close()

#createTables()
#setContract("addr","abi")
#print(getContract())
#setMessage("addr","name",'time','contsasfasfsafasfasf asfads fadsfa ')
#print(getMessage("addr","name",'time'))
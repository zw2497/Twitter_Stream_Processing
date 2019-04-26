from pyhive import hive
conn = hive.Connection(host="localhost", port=10000)
cur = conn.cursor()
cur.execute('show tables');
print(cur.fetchone())
ab -p join.json -T application/json -c 100 -n 100 http://localhost:2000/join
ab -p join-fix.json -T application/json -c 100 -n 100 http://localhost:2000/join-fix
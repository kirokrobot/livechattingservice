//서버 작업

/*설치한 express 모듈 불러오기 */
//명령어 고정
const express = require('express')

/* 설치한 socket.io 모듈 불러오기 */
//명령어 고정
const socket = require('socket.io')

/* Node.js 기본 내장 모듈 불러오기 */
//명령어 고정
const http = require('http')

/*node.js 기본 내장 모듈 불러오기*/
//명령어 고정
const fs = require('fs')

/* express 객체 생성 */
//명령어 고정
const app = express()

/* express http 서버 생성 */
//명령어 고정
const server = http.createServer(app)

/* 생성된 서버를 socket.io에 바인딩 */
//명령어 고정
const io = socket(server)

/* app.use를 사용하여 원하는 미들웨어를 추가하여 조합*/
/* app.use('/css', express.static('./static/css'))로 실행되는 
서버 코드 기준 디렉토리의 static 폴더 안의 css 폴더는
외부 클라이언트들이 /css 경로로 액세스*/

app.use('/css', express.static('./static/css'))
app.use('/js', express.static('./static/js'))

/*Get 방식으로 / 경로에 접속하면 실행됨 
fs 모듈로 index.html 파일 읽고 클라이언트로 읽은 내용을 전달
우리가 클라이언트에 보낼 내용은 index.html */
app.get('/', function(request, response) {
    /*readfile()함수는 지정된 파일을 읽어 데이터를 가져옴*/
    fs.readFile('./static/index.html', function(err, data) {
        if(err) {
            response.send('에러')
        } else {
            /*html 파일이라는 걸 알려야해서 헤더에 해당 내용 작성*/
            response.writeHead(200, {'Content-Type':'text/html'})
            /*html 데이터 전송*/
            response.write(data)
            /*완료 알림, write를 통해 응답할 경우 end 반드시 사용-> 제약..?*/
            response.end()
        }
    })
})

/* Get 방식으로 / 경로에 접속하면 실행됨 
app.get('/', function(request, response) {
    console.log('유저가 / 으로 접속하였습니다!')

    /*클라이언트로 문자열 응답
    response.send('Hello, Express Server!!')
})*/

/*io.sockets = 접속되는 모든 소켓
connection이라는 이벤트가 발생하면 콜백함수 실행
sockets.on ~ function()으로 접속과 동시에 콜백함수로 전달됨
기본이벤트(connection, disconnetct 등)을 제외하고 
원하는 이벤트 명 지정하여 통신 가능*/

io.sockets.on('connection', function(socket) {
    
    /*send라는 이벤트를 받으면 호출*/
    // 새로운 유저가 접속했을 경우 다른 소켓에도 알려줌
    socket.on('newUser', function(name) {
        console.log(name + ' 님이 접속하였습니다.')

        //클라이언트로부터 받은 닉네임을 소켓에 저장
        socket.name = name

        //모든 소켓에게 정보를 받은 닉네임을 다른 유저에게도 알림
        io.sockets.emit('update',{type:'connect',name:'SERVER',message: name + '님이 접속하였습니다.'})
    })

    //전송한 메시지 받기
    socket.on('message', function(data){
    //받은 데이터에 누가 보냈는지 이름 추가
    data.name = socket.name

    console.log(data)

    //보낸 사람을 제외한 나머지 유저에게 메시지 전송
    //io.sockets.emit() = 모든 유저(본인 포함)
    //socket.broadcast.emit() = 본인을 제외한 나머지 모두
    socket.broadcast.emit('update', data);
    })

    //접속종료
    socket.on('disconnect', function() {
        console.log(socket.name + '님이 나가셨습니다.')

        //나가는사람을 제외한 나머지 유저에게 메시지 전송
        socket.broadcast.emit('update', {type: 'disconnect', name: 'SERVER', message: socket.name + '님이 나가셨습니다.'});
    })

    })

/* 서버를 8080 포트로 listen */
server.listen(8080, function() {
    console.log('서버 실행중..')
})
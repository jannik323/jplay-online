let socket = io();


function slide(self){
    if(self.nextElementSibling.getAttribute("slide")=="on"){
        self.nextElementSibling.setAttribute("slide","off");
        self.setAttribute("slide","off");
    }else{
        self.nextElementSibling.setAttribute("slide","on");
        self.setAttribute("slide","on");

    }
}

function makeroom(){
    let roomname = document.getElementById("m_roomname").value;
    let roompas = document.getElementById("m_roompas").value;
    roompas=roompas||null;
    
    if(!roomname){return;}

    socket.emit("makeroom",{name:roomname,password:roompas});




}

function transitionelement(e,visibility=false) {
    let ele = document.getElementById(e);

    if(visibility){
        let eheight = ele.style.height;
        let epadd = ele.style.padding;
        let emargi = ele.style.margin;
        ele.style.height = "0px";
        ele.style.padding = "0px";
        ele.style.margin = "0px";
        ele.style.display= "flex";
        ele.style.visibility= "hidden";
        setTimeout(() => {
            ele.style.visibility= "visible";
            ele.style.height = eheight;
            ele.style.padding = epadd;
            ele.style.margin = emargi;

        }, 1100);
    }else{
        ele.style.height = "0px";
        ele.style.padding = "0px";
        ele.style.margin = "0px;"
        setTimeout(() => {
            ele.style.display = "none";
        }, 1100);
    }

}

function joinroom(){
    let roomname = document.getElementById("j_roomname").value;
    let roompas = document.getElementById("j_roompas").value;
socket.emit("joinroom",{name:roomname,password:roompas})
}

function makemsg(msgdata,system=false){
    let chat = document.getElementById("chat")
    let msg = document.createElement("input");
        msg.type="text";
        msg.disabled = true;
        msg.value=msgdata;
        if(system){
            msg.style.color = "red"
        }
        
        chat.appendChild(msg);
        chat.scrollTop=chat.scrollHeight;
}

function makelinkmsg(pre,msgdata){
    let chat = document.getElementById("chat")
    let msg = document.createElement("input");
        msg.type="text";
        msg.disabled = true;
        msg.value=pre;
        
        let link = document.createElement("a");
            link.innerHTML =msgdata;
            link.href = new URL(msgdata);
        msg.innerHTML = pre+" : "
        chat.appendChild(msg);
        chat.appendChild(link);
}

document.getElementById("msgtext").addEventListener("keydown",e=>{
    if(e.code==="Enter"){
        sendmsg();
    }
})

function sendmsg(){
    let msg =document.getElementById("msgtext");
    msg.value = msg.value||" ";
    if(msg.value==" "){return;}
    socket.emit("sendmsg",msg.value);
    msg.value = "";
}

function sendnick(){
    let nick = document.getElementById("nicktext");
    nick.value = nick.value||" ";
    if(nick.value==" "){return;}
    socket.emit("sendnick",nick.value);
    nick.value = "";
}

document.getElementById("nicktext").addEventListener("keydown",e=>{
    if(e.code==="Enter"){
        sendnick();
    }
})

socket.on("ratelimit",data=>{
    alert("You got ratelimited. Wait "+ data/1000 + " seconds until you can perform that action again.")
})

socket.on("lastmsgs",data=>{
    data.forEach((e)=>{
        if(data.system){
            makemsg(data.msg,true);
        }else{

            let pattern = new RegExp(/(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/igm);
                if(pattern.test(e.msg)){
                    makelinkmsg(e.pre+" : ",e.msg)
                    return;
                }
            makemsg(e.pre+" : " +e.msg);        
        }
    })
})

socket.on("sendmsg",data=>{
    let pattern = new RegExp(/(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/igm);
        if(pattern.test(data.msg)){
            makelinkmsg(data.pre+" : ",data.msg)
            return;
        }
    makemsg(data.pre+" : " +data.msg);
})

socket.on("sysmsg",data=>{
    makemsg(data,true);
})

socket.on("joinedroom",room=>{

    if(room=="default"){return;}

    transitionelement("roommakediv");
    transitionelement("roomjoindiv");
    transitionelement("chatroomsdiv");
    transitionelement("chatroom",true);
    document.getElementById("chat_roomname").innerHTML = "Room: " +room;
})

socket.on("userlist",data=>{
    let memberlist = document.getElementById("memberlist");
    memberlist.innerHTML = "";
    data.forEach(e=>{
        let member = document.createElement("input");
        member.type="text";
        member.disabled = true;
        member.value=e
        memberlist.appendChild(member);
    })
})

socket.on("rooms",rooms=>{
    let roomshtml =  document.getElementById("chatroomsdiv");
    roomshtml.innerHTML = "";
    rooms.forEach(e=>{
        if(e.name =="default"){return;}
        let room = document.createElement("div");
        room.classList.add("roomdisdiv")

        let text = document.createElement("input");
        text.type = "text";
        text.disabled = true;
        text.value= "Room:  "+e.name;
        room.appendChild(text);

        let count = document.createElement("input");
        count.type = "text";
        count.disabled = true;
        count.value= "Users: "+e.count;
        room.appendChild(count);

        if(e.haspassword){
            let pass = document.createElement("input");
            pass.type = "password";
            pass.name ="password";
            pass.placeholder = "password"
            room.appendChild(pass);
        }

        let btn = document.createElement("input");
        btn.type = "button";
        if(e.haspassword){
            btn.addEventListener("click",()=>{socket.emit("joinroom",{name:e.name,password:btn.previousElementSibling.value})});
        }else{
            btn.addEventListener("click",()=>{socket.emit("joinroom",{name:e.name,password:null})});
        }
        btn.value = "join";
        room.appendChild(btn);


        roomshtml.appendChild(room);
    })

})

//canvas zeug 

let canvas = document.getElementById("bgcanvas");
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
let ctx = canvas.getContext("2d");
thingarr = [];
mousex = 0;
mousey = 0;

class things{
    constructor(x){
        this.x = x;
        this.y = (Math.random()*canvas.height);
        this.reset();
        thingarr.push(this);
    }
    update(){
        this.y+=this.cy+this.ya;
        this.x+=this.cx+this.xa;
        this.xa *=0.95;
        this.ya *=0.95;
        if(this.y>canvas.height+this.size){
            this.reset();
            this.y = 0-this.size;
        }
        if(this.x>canvas.width+this.size){
            this.x = 0-this.size;
        }
        if(this.x<0-this.size){
            this.x = canvas.width+this.size;
        }
        if(distance(this.x,mousex,this.y,mousey)<this.size){
            this.xa=-(this.x-mousex)/2;
            this.ya=-(this.y-mousey)/2;
        }
    }
    render(){
        ctx.fillStyle= "black";
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
        ctx.fill();
    }
    reset(){
        this.cx = randomrange(-1,1);
        this.cy = randomrange(1,2);
        this.ya = 0
        this.xa = 0
        this.size =randomrange(15,50);
        
    }
}

for (let i = 0; i < 100; i++) {
    new things(randomrange(0,canvas.width)); 
}

setInterval(()=>{
ctx.clearRect(0,0,canvas.width,canvas.height),
    thingarr.forEach(e => {
        e.update();
        e.render();
    });
},1000/30)


addEventListener("mousemove",(e)=>{
mousex= e.clientX;
mousey= e.clientY;
})

window.addEventListener('resize', function(e) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
});

//misc 

function randomrange(min, max) { 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function distance(x1,x2,y1,y2){
    return Math.sqrt(((x2-x1)**2)+((y2-y1)**2));
}
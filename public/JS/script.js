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

socket.on("gameturn",()=>{

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
    transitionelement("ingame",true);
    document.getElementById("chat_roomname").innerHTML = "Room: " +room;
    setTimeout(()=>{
        startgame();
    },2000)
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
        count.value= "Users: "+e.count+"/"+e.countlim;
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

socket.on("eplacecross",(data)=>{
    if(cells.length==0){return;}
    cells[data.x][data.y].active=true;
    if(socket.id==data.id){
        cells[data.x][data.y].local = true;
    }
})

socket.on("resetgame",()=>{
    state=true;
    cells.forEach(row=>row.forEach(e=>{e.reset()}));
    setTimeout(()=>{state=false;},1000)
})

//misc 

function randomrange(min, max) { 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function distance(x1,x2,y1,y2){
    return Math.sqrt(((x2-x1)**2)+((y2-y1)**2));
}

//game section

let canvas;
let ctx;
let cells;
const gridsize = 3;
let gridscale;
let fps = 10;
let state=false;

let lastTime;
function gameloop() {
    if(state){return}
    render();
}

function render(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    cells.forEach(row=>row.forEach(e=>{e.render()}));
}

class Cell{
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.active = false;
        this.local = false;
    }

    reset(){
        this.active = false;
        this.local = false;
    }

    render(){
        
        ctx.strokeRect(this.x*gridscale, this.y*gridscale, gridscale, gridscale); 
        if(this.active){
            if(this.local){
                ctx.beginPath();
                ctx.moveTo(this.x*gridscale,this.y*gridscale);
                ctx.lineTo((this.x*gridscale)+gridscale,(this.y*gridscale)+gridscale);
                ctx.moveTo(this.x*gridscale,this.y*gridscale+gridscale);
                ctx.lineTo((this.x*gridscale)+gridscale,(this.y*gridscale));
                ctx.stroke();
            }else{
                ctx.beginPath();
                ctx.arc((this.x*gridscale)+(gridscale/2),(this.y*gridscale)+(gridscale/2),gridscale/2,0,Math.PI*2,);
                ctx.stroke();
            }
            
        }
    }
}

function startgame(){
    canvas = document.getElementById("gamecanvas");
    ctx = canvas.getContext("2d");
    canvas.width = canvas.height =  canvas.clientWidth;
    
    cells = [];
    gridscale = canvas.width/gridsize;

    for (let x = 0; x < gridsize; x++) {
        cells[x] = [];
        for (let y = 0; y < gridsize; y++) {
            cells[x][y] =new Cell(x,y);
        }
    }

    addEventListener("click",mousclick);
    canvas.addEventListener("resize",()=>{
        canvas.width = canvas.height = canvas.clientWidth;
        gridscale = canvas.width/gridsize;
    })
    setInterval(()=>{gameloop()},1000/fps)

}

function mousclick(e){
    let rect = canvas.getBoundingClientRect();
    if(e.clientX > rect.left && e.clientX < rect.right && e.clientY > rect.top && e.clientY < rect.bottom ){
        let mposx = (Math.floor((e.clientX- rect.left)/gridscale));
        let mposy = (Math.floor((e.clientY- rect.top)/gridscale));
        socket.emit("placecross",{x:mposx,y:mposy});
    }
}

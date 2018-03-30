/**
 * Created by Jules LAURENT on 17/01/2017.
 */
/** Form onclick update **/
var radiogmsolo = document.getElementById("gmsolo");
radiogmsolo.addEventListener("click",function(){
    document.getElementById("j2").setAttribute("placeholder","J.A.R.V.I.S") ;
    document.getElementById("j2").setAttribute("disabled","");
    document.getElementById("j2").value = "";
});
var radiogmmulti = document.getElementById("gmmulti");
radiogmmulti.addEventListener("click",function(){
    document.getElementById("j2").setAttribute("placeholder","Joueur 2");
    document.getElementById("j2").removeAttribute("disabled");
});

/** Initializing global variables **/
var joueur1;
var joueur2;
var plateau;
var scoreTable;

/***********************************************************
*** Definition des classes : joueur,scoreTable et Plateau **
***********************************************************/
function Joueur(name,isIA) {
    this.name = name;
    this.playing = false;
    this.line = null;
    this.score = 0;
    this.IA = isIA;
}

function currentPlayer()
{
    if (joueur1.playing) {return joueur1;}
    else{return joueur2;}
}
function switchPlayer()
{
    console.log("Changement de joueur");
    if (joueur1.playing) {
        joueur1.line = null;
        joueur1.playing = false;
        joueur2.playing = true;
        if (joueur2.IA && plateau.winner==null){Ia_play();}
    }
    else {
    joueur2.line = null;
    joueur2.playing = false;
    joueur1.playing = true;
    }

    document.getElementById("playing").innerText = currentPlayer().name;
    console.log("RESET");
    if(plateau.winner == null) {document.getElementById('msg').innerText="";}

}
function Ia_play()
{
    /** Generating the Marienbad game binary method. */
    var perline_report = [];
    var report = [];
    var msb = 0;
    var matchesRemoved = 0;
    for(var i =0;i<plateau.occupation.length;i++)
    {
        var line_count = plateau.checkLine(i).toString(2);
        if(line_count.length > msb) {msb = line_count.length;}
        perline_report.push(line_count);
    }
    /** Adjusting string sizes for next operations */
    for(i = 0;i<perline_report.length;i++)
    {
        while(perline_report[i].length < msb)
        {
            perline_report[i] = "0" + perline_report[i];
        }
    }
    /** Generating binary report **/
    for(var y=0;y<msb;y++)
    {
        var sum = 0;
        for (i = 0; i < perline_report.length; i++)
        {
            sum += Number(perline_report[i][y]);
        }
        report.push(sum);
    }

    /**Looking for even or odd depending on the gamerule to define target line, once it's done remove matches */
    var targetLine;
    for(y =0;y<msb;y++)
    {
        if(((plateau.lastIsWinner && report[y]%2 ==1)||(!plateau.lastIsWinner && report[y]%2 == 0)) && report[y]!==0)
        {
            targetLine = null;
            for(i =0;(i<perline_report.length) && (targetLine == null);i++)
            {
                if(Number(perline_report[i][y]) == 1) {targetLine = i;}
            }
            var matchesToRemove = Math.pow(2,msb-y-1);
            var a =IaRemoveMatches(targetLine,matchesToRemove);
            if(a > matchesRemoved){ matchesRemoved = a;}
        }
    }
    /** If there is not take random line and remove one match*/

        for (i = 0; i < plateau.occupation.length && targetLine == null; i++) {
            if (plateau.checkLine(i) > 0) {
                targetLine = i;
                matchesToRemove = 1;
                matchesRemoved = 1;
                IaRemoveMatches(targetLine, matchesToRemove);
            }
        }

    /** Wait for all the matches to be removed before letting the human being play*/
    setTimeout(function() {
        if (plateau.winner == null) {
            console.log("IAFIN");
            document.getElementById("nxt_button").click();
        }
    },1000*(matchesRemoved +1));

}

/* Remove matches one by one */
function IaRemoveMatches(targetLine,matchesToRemove)
{
    if("div"+String(targetLine)===joueur2.line || joueur2.line === null)
    {
        var matchesRemoved = 0;
        joueur2.line = "div"+String(targetLine); /** Already perform somewhere else, but have to do it here because of timeout issue */
        for(var i =0;i<plateau.occupation[targetLine].length && matchesRemoved < matchesToRemove;i++)
        {
            if (plateau.occupation[targetLine][i] == 1)
            {
                console.log("TIMEOUT",matchesRemoved*1000,"on",targetLine);
                setTimeout(function (i,targetLine) {document.getElementById(String(targetLine)+String(i)).click();}, 1000 * matchesRemoved,i,targetLine);
                matchesRemoved += 1;
            }
        }
    }
    return matchesRemoved;
}

/** Generating score table with players name */
function ScoreTable() {
    this.player1 = joueur1;
    this.player2 = joueur2;

    var tableau = document.createElement("table");
    tableau.setAttribute("class","score");
    tableau.setAttribute("id","score");

    var tmp_tr = document.createElement("tr");
    tmp_tr.appendChild(document.createElement("th"));
    tmp_tr.childNodes[0].innerText = "SCORES";
    tmp_tr.childNodes[0].setAttribute("colspan","2");
    tableau.appendChild(tmp_tr);

    tmp_tr = document.createElement("tr");
    tmp_tr.appendChild(document.createElement("th"));
    tmp_tr.appendChild(document.createElement("td"));
    tmp_tr.childNodes[0].innerText = joueur1.name;
    tmp_tr.childNodes[1].innerText = joueur1.score;
    tableau.appendChild(tmp_tr);

    tmp_tr = document.createElement("tr");
    tmp_tr.appendChild(document.createElement("th"));
    tmp_tr.appendChild(document.createElement("td"));
    tmp_tr.childNodes[0].innerText = joueur2.name;
    tmp_tr.childNodes[1].innerText = joueur2.score;
    tableau.appendChild(tmp_tr);

    document.getElementById("sideinfos").appendChild(tableau);
}
ScoreTable.prototype.update = function()
{
    document.getElementById("score").childNodes[1].childNodes[1].innerText = this.player1.score;
    document.getElementById("score").childNodes[2].childNodes[1].innerText = this.player2.score;
};

function Plateau(isLastWinner) {
    this.occupation = [];
    this.linesSize = [1,3,5,7];
    this.lastIsWinner = isLastWinner;
    this.winner = null;
}
Plateau.prototype.create = function ()
{
    for(var i = 0;i<this.linesSize.length;i++)
    {
        var tmp_lineOccupation = [];
        var tmp_div = document.createElement("div");
        tmp_div.setAttribute("id","div" + String(i));
        tmp_div.setAttribute("class","line");
        for(var y = 0;y<this.linesSize[i];y++)
        {
            var tmp_img = document.createElement("img");
            tmp_img.setAttribute("src","sources/matches.png");
            tmp_img.setAttribute("class","matches");
            tmp_img.setAttribute("id",String(i)+String(y));
            tmp_img.addEventListener('click',function(e) {
                if (!currentPlayer().IA || (currentPlayer().IA && e.clientX == 0 && e.clientY == 0))
                {
                    if ((this.parentNode.id == currentPlayer().line || currentPlayer().line == null)
                            && plateau.occupation[Math.trunc(Number(this.id) / 10)][Number(this.id) % 10] === 1)
                    {
                        this.hide();
                        plateau.occupation[Math.trunc(Number(this.id) / 10)][Number(this.id) % 10] = 0;
                        currentPlayer().line = this.parentNode.id;
                        setTimeout(function () {plateau.checkForWinner();},1000);

                    } else { console.log(plateau.occupation);console.log(this.parentNode.id + "vs" + currentPlayer().line); document.getElementById("msg").innerHTML = currentPlayer().name + " Please do not try to cheat.1";}
                } else { document.getElementById("msg").innerHTML = joueur1.name + " Please do not try to cheat.2";}

            });
            tmp_div.appendChild(tmp_img);
            tmp_lineOccupation.push(1);
        }
        document.getElementById("plateau").appendChild(tmp_div);
        this.occupation.push(tmp_lineOccupation);
    }
};
Plateau.prototype.destroy = function()
{
    this.occupation = [];
    while(document.getElementsByClassName("line").length !== 0)
    {
        document.getElementById("plateau").removeChild(document.getElementById("plateau").firstChild);
        console.log("removed");
    }
};
Plateau.prototype.reset = function()
{
    this.destroy();
    this.create();
    this.winner = null;
    joueur1.line = null;
    joueur2.line = null;
};
Plateau.prototype.checkLine = function(y)
{
    var sum = 0;
    for (var i = 0; i < this.occupation[y].length; i++)
    {
        sum += this.occupation[y][i];
    }
    return sum;
};
Plateau.prototype.checkLines = function()
{
    var total = 0;
    for(var y = 0; y<this.occupation.length;y++)
    {
        var sum = this.checkLine(y);
        if (sum == 0)
        {
            document.getElementById("div" + String(y)).hide();
        }
        total += sum;
    }
    return total;
};
Plateau.prototype.checkForWinner = function()
{
    console.log(plateau.occupation);
    if(this.checkLines() == 0)
    {
        this.winner = currentPlayer();
        console.log('WINNER');

        if(this.lastIsWinner)
        {
            document.getElementById('msg').innerHTML = "Congrats " + currentPlayer().name + " ! You rocked it up ";
        }
        else
        {
            var looser_name = currentPlayer().name;
            switchPlayer();
            console.log("Message : ");
            document.getElementById('msg').innerHTML = "Sorry " + looser_name + "... But " + currentPlayer().name + " won this round. U mad ? "
        }
        currentPlayer().score += 1;
        scoreTable.update();
        setTimeout(function (){
            if(confirm("Commencez une nouvelle partie ? "))
            {
                plateau.reset();
                switchPlayer();
            }
            else{ document.getElementById('end_btn').click();}
        },3000);
    }
};

/** *********************************************************/

/** Creating buttons and current player display */
function createButtons()
{
    var whoplays = document.createElement("p");
    whoplays.innerHTML = "C \'est au tour de <i id=\'playing\'> </i> de jouer.";
    document.getElementById("sideinfos").appendChild(whoplays);

    var msg = document.createElement("p");
    msg.setAttribute("id","msg");
    document.getElementById("sideinfos").appendChild(msg);

    var boutons = document.createElement("div");
    boutons.setAttribute("id","buttons");

    var next_btn = document.createElement("button");
    next_btn.innerText = "I'm done";
    next_btn.setAttribute("id","nxt_button");
    next_btn.setAttribute("type","button");
    next_btn.addEventListener("click",function(E) {
        if(currentPlayer().IA && E.clientY !== 0) {document.getElementById('msg').innerHTML = joueur1.name + " please do not try to skip my turn. You cheater !";}
        else if (currentPlayer().line !== null && plateau.winner == null)
        {
            //plateau.checkLines();
            switchPlayer();
        }
        else
        {
            document.getElementById('msg').innerHTML = "Please pick up at least one of the matches"
        }

    });
    boutons.appendChild(next_btn);

    var end_btn = document.createElement("button");
    end_btn.innerText = "Stop the game";
    end_btn.setAttribute("id","end_btn");
    end_btn.setAttribute("type","button");
    end_btn.addEventListener("click",function() {
       plateau.destroy();
       var winner;
       var tmp_div = document.createElement("div");
       tmp_div.setAttribute("id","msg_fin");
       if(joueur1.score > joueur2.score){winner = joueur1.name;}
       else if (joueur2.score > joueur1.score) {winner = joueur2.name;}
       else {winner = 'Nobody';}
       tmp_div.innerHTML = "<p>" + winner + " won this game</p>";
       document.getElementById('plateau').appendChild(tmp_div);
       var new_btn = document.createElement('button');
       new_btn.innerText = "Nouvelle partie";
       new_btn.addEventListener('click',function (){location.reload();});
       document.getElementById('plateau').appendChild(new_btn);
    });
    boutons.appendChild(end_btn);

    document.getElementById("sideinfos").appendChild(boutons);
}
/** Creating a new method for Element to remove elements */
Element.prototype.hide = function()
{
    if (this.tagName == 'DIV')
    {
        this.style.display = "none";
    }
    else if (this.tagName == 'IMG')
    {
        this.setAttribute("src", "sources/burn.gif");
        setTimeout(function (self) {self.setAttribute("src", "sources/blanc.png");}, 990, this);
    }
};

/** Retrieving game information from the form and initializing the game */
document.getElementsByTagName("form")[0].addEventListener("submit", function (event) {
    event.preventDefault();
    console.log(event);

    joueur1 = new Joueur(document.getElementById("j1").value,false);
    console.log(joueur1.nom);

    if (document.getElementById("gmsolo").checked)
    {
        joueur2 = new Joueur("J.A.R.V.I.S",true);
    }
    else
    {
        joueur2 = new Joueur(document.getElementById("j2").value,false);
    }

    plateau = new Plateau(document.getElementById("lastwin").checked);
    plateau.reset();
    scoreTable = new ScoreTable(joueur1,joueur2);
    createButtons();
    switchPlayer();
    document.getElementById("gameinfos").style.display = "none";
});
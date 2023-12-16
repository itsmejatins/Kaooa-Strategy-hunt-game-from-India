var log = "";

standbyCrowsID = ["crow1", "crow2", "crow3", "crow4", "crow5", "crow6", "crow7"];
killCrowID = ""
numCrowsKilled = 0;
winner = "";

adjList = new Map();
adjList.set(1, [3, 4]); adjList.set(2, [3, 7]); adjList.set(3, [1, 2, 4, 7]);
adjList.set(4, [1, 3, 5, 6]); adjList.set(5, [4, 6]); adjList.set(6, [4, 5, 9, 10]);
adjList.set(7, [2, 3, 9, 8]); adjList.set(8, [7, 9]); adjList.set(9, [6, 7, 8, 10]);
adjList.set(10, [6, 9]);
jumpList = new Map();
jumpList.set(1, [[3, 7], [4, 6]]); jumpList.set(2, [[3, 4], [7, 9]]);
jumpList.set(3, [[7, 8], [4, 5]]); jumpList.set(4, [[3, 2], [6, 10]]);
jumpList.set(5, [[4, 3], [6, 9]]); jumpList.set(6, [[4, 1], [9, 8]]);
jumpList.set(7, [[3, 1], [9, 10]]); jumpList.set(8, [[9, 6], [7, 3]]);
jumpList.set(9, [[7, 2], [6, 5]]); jumpList.set(10, [[9, 7], [6, 4]]);

var slotOccupancy = [] // denotes which slotes are empty
for(var i = 0 ; i < 10; i++)
{
  slotOccupancy.push("empty");
}

var turn = "crow";
var activeBird = "";
var currentBird ="";

var crowList = document.getElementsByClassName("crow");
for(var i = 0; i < crowList.length ; i++) {

  crowList[i].addEventListener("dragstart", function(e) {
    activeBird = "crow";
    currentBird = e.target.id;
    log += "Event::dragstart:: current bird = " + currentBird + "::activeBird = " + activeBird + "::turn = " + turn + "\n";
  })
  crowList[i].addEventListener("dragend", function() {
    log += "Event::dragend\n";
  })
}
document.getElementsByClassName("vulture")[0].addEventListener("dragstart", function(e) {
  activeBird = "vulture";
  currentBird = e.target.id;
  log += "Event::dragstart:: current bird = " + currentBird + "::activeBird = " + activeBird + "::turn = " + turn + "\n";
})
document.getElementsByClassName("vulture")[0].addEventListener("dragend", function(e) {
  log += "Event::dragend\n";
})

var slotArray = document.getElementsByClassName("slot");
for(var i = 0; i < slotArray.length; i++) {
  slotArray[i].addEventListener("dragenter", function(e) {
    if(!e.currentTarget.classList.contains("hold"))
      e.currentTarget.classList.add("hold");
  });

  slotArray[i].addEventListener("dragleave", function(e) {
    if(e.currentTarget.classList.contains("hold"))
      e.currentTarget.classList.remove("hold");
    if(e.target.classList.contains("hold"))
      e.target.classList.remove("hold");
  });

  slotArray[i].addEventListener("dragover", function(e) {
    e.preventDefault();
  });

  slotArray[i].addEventListener("drop", function(e) {
    var slotNumber = e.currentTarget.id.charAt(e.currentTarget.id.length - 1);
    slotNumber = parseInt(slotNumber, 10);
    if(e.currentTarget.id.charAt(e.currentTarget.id.length - 2) == 1)
      slotNumber = 10;

    var check1 = (turn === activeBird);
    var check2 = validateStandbyCondition(currentBird);
    var check3 = validateMoveAdjacency(currentBird, slotNumber);
    var check4 = validateJumpMove(currentBird, slotNumber);
    var check5 = slotOccupancy[slotNumber - 1] === "empty";

    // console.log("turn::" + check1);
    // console.log("standby::" + check2);
    // console.log("adjMove::" + check3);
    // console.log("jumpMove::" + check4);
    // console.log("emptySlot::" + check5);

    if(check1 && check2 && (check3 || check4) && check5)
    {
      for(var i = 0 ; i < slotOccupancy.length ; i++)
      {
        if(slotOccupancy[i] === currentBird)
        {
          slotOccupancy[i] = "empty";
        }
      }
      slotOccupancy[slotNumber - 1] = currentBird;
      e.currentTarget.append(document.getElementById(currentBird));
      var cbcl = document.getElementById(currentBird).classList;

      if(cbcl.contains("absP"))
      {
        cbcl.remove(currentBird + "helper");
        cbcl.remove("absP");
        cbcl.add("relP");
        // remember that currentBird is the id of the activeBird. You could have also matched first character
        if(document.getElementById(currentBird).classList.contains("vulture"))
          cbcl.add("vulture-slot-correction-factor");
        else
          cbcl.add("crow-slot-correction-factor");
      }

      if(e.target.classList.contains("hold"))
        e.target.classList.remove("hold");
      if(e.currentTarget.classList.contains("hold"))
        e.currentTarget.classList.remove("hold");

      if(turn === "crow")
        turn = "vulture";
      else
        turn = "crow";
      updateStandbyCrowsList(currentBird);
      if(!check3 && check4) // crow has been killed
        deleteCrow();

      if(checkWinner())
      setTimeout(resetGame,0);
      log += "Event::drop::(SlotNumber, turn, activeBird) = (" + slotNumber + ", " + turn + ", " + activeBird + ")\n";
    }
    else
    {
      if(e.target.classList.contains("hold"))
        e.target.classList.remove("hold");
      if(e.currentTarget.classList.contains("hold"))
        e.currentTarget.classList.remove("hold");
      log = "Event::drop::No action taken\n";
    }
  });
}

// Utility functions
function validateMoveAdjacency(currentBirdID, dropSlotNumber)
{
  // console.log("validateMoveAdjacency::" + currentBirdID + "::" + dropSlotNumber);
    var currSlotIndex = -1;
    for(var i = 0; i < slotOccupancy.length; i++)
    {
      if(slotOccupancy[i] === currentBirdID)
      {
        currSlotIndex = i;
        break;
      }
    }
    // console.log("validateMoveAdjacency::" + currSlotIndex);
    if(currSlotIndex === -1) //this means that vulture is in standby mode
      return true;
    var currSlotAdjList = adjList.get(currSlotIndex + 1);

    for(var i = 0 ; i < currSlotAdjList.length ; i++)
    {

      if(currSlotAdjList[i] === dropSlotNumber)
        return true;
    }
    return false;
}

function validateJumpMove(currentBirdID, dropSlotNumber)
{
  if(currentBirdID != "vulture1") // bird must be a vulture
    return false;
  var currSlotIndex = -1;
  for(var i = 0; i < slotOccupancy.length; i++)
  {
    if(slotOccupancy[i] === currentBirdID)
    {
      currSlotIndex = i;
      break;
    }
  }
  if(currSlotIndex === -1) // this means that vulture is in standby mode
    return true;

  var currSlotJumpList = jumpList.get(currSlotIndex + 1);
  for(var i = 0 ; i < currSlotJumpList.length; i++)
  {
    adjSlotNum = currSlotJumpList[i][0];
    jumpSlotNum = currSlotJumpList[i][1];
    if((dropSlotNumber === jumpSlotNum) && (slotOccupancy[adjSlotNum - 1].charAt(0) === 'c'))
    {
      killCrowID = slotOccupancy[adjSlotNum - 1];
      return true;
    }
  }
  return false;
}

function validateStandbyCondition(currentBirdID) // currentBirdID must not be vulture or must not be present in standbyCrowsID
{
  if(currentBirdID === "vulture1")
    return true;
  if(standbyCrowsID.length === 0)
    return true;
  if(standbyCrowsID.length > 0)
  {
    for(var i = 0; i < standbyCrowsID.length ; i++)
    {
      if(standbyCrowsID[i] === currentBirdID)
        return true;
    }
  }
  return false;
}

function updateStandbyCrowsList(currentBirdID) // need to remove currentBirdID from standbyCrowsID
{
  if(currentBirdID === "vulture1")
    return;

  var newStandbyCrowsID = [];
  for(var i = 0 ; i < standbyCrowsID.length; i++)
  {
    if(standbyCrowsID[i] != currentBird)
      newStandbyCrowsID.push(standbyCrowsID[i]);
  }
  standbyCrowsID = newStandbyCrowsID;
}

function deleteCrow()
{
  document.getElementById(killCrowID).remove();
  numCrowsKilled++;
  for(var i = 0; i < slotOccupancy.length; i++)
  {
    if(slotOccupancy[i] === killCrowID)
    {
      slotOccupancy[i] = "empty";
      break;
    }
  }
  killCrowID = "";
}

function checkWinner()
{
  if(numCrowsKilled === 4)
  {
    winner = "Vulture"
    return true;
  }
  vultureSlotIndex = -1;
  for(var i = 0; i < slotOccupancy.length; i++)
  {
    if(slotOccupancy[i] === "vulture1")
    {
      vultureSlotIndex = i;
      break;
    }
  }
  if(vultureSlotIndex === -1)
    return false;

  vultureSlotAdjList = adjList.get(vultureSlotIndex + 1);
  vultureSlotJumpList = jumpList.get(vultureSlotIndex + 1);
  var adjSlotEmpty = false;
  var canJump = false;
  for(var i = 0 ; i < vultureSlotAdjList.length; i++)
  {
    if(slotOccupancy[vultureSlotAdjList[i] - 1] === "empty")
    {
      adjSlotEmpty = true;
      break;
    }
  }
  for(var i = 0; i < vultureSlotJumpList.length; i++)
  {
    adjSlotNum = vultureSlotJumpList[i][0];
    jumpSlotNum = vultureSlotJumpList[i][1];
    if(slotOccupancy[adjSlotNum - 1].charAt(0) === 'c' && slotOccupancy[jumpSlotNum - 1] === "empty")
    {
      canJump = true;
      break;
    }
  }

  if(!adjSlotEmpty && !canJump)
  {
    winner = "Crow"
    return true;
  }
  return false;
}

function resetGame()
{
  alert(winner + " wins! Click okay to play again.");
  window.location.reload();
}

// QUESTION 2

window.onload = function() {
  document.getElementById("download-link").onclick = function(code) {
    this.href = 'data:text/plain;charset=utf-11,' + encodeURIComponent(log);
  };
};

//Ajax search

$(document).ready(function()
{
 $('#search').keyup(function()
 {
  $('#result').html('');
  $('#state').val('');

  var searchField = $('#search').val();
  var expression = new RegExp(searchField, "i");
  $.ajax({
      url:'/deckbuilder/searchcard',
      data:{searchField:searchField,formatSelected:formatSelected},
      dataType:'JSON',
      type:'GET',
      contentType: 'application/json',
      success:function(data){
        $.each(data, function(key, value){
            if (value.name.search(expression) != -1 && searchField.length >2)
            {
                $('#result').append('<li class="list-group-item link-class"><a href="'+value.imageUrlHiRes+'"><img src="'+value.imageUrl+'" height="40" width="40" class="img-thumbnail" /> '+value.name+' | <span class="text-muted">'
                +value.set+' '+value.number+' '+value.rarity+'</span></a><button onclick="addCard(\''+value.imageUrl+'\',\''+value.id+'\',\''+value._id+'\')">Add to Deck</button></li>');  
            }
        });   
    },
 });
});
});

// initializes the cards on screen array
let cardsOnScreen = [];
let cardCounter=0;
// adds card to cardsOnScreen after checking for unique and incrementing instances if not
function addCard(cardImgUrl,cardId,card_Id)
{
    if (cardCounter <60){
        increment=incrementAndSort(cardId);    
        if (increment==false){
            let cardObject={"id": cardId, "imageUrl": cardImgUrl,"instances": 1,"_id": card_Id}
            cardsOnScreen.push(cardObject);
            
        }
        else{}
    }
    else{alert("Can't have more than 60 cards! Remove some")}
    
    drawcards();

    
}

// returns whether or not to increment card instances number
function incrementAndSort(cardId)
{
    if (cardsOnScreen.length === 0){
        return false;
    }
    else{
       for(let i = 0; i <cardsOnScreen.length; i++){
            if (cardsOnScreen[i].id == cardId){
                let name=String(cardsOnScreen[i].name);
                    cardsOnScreen[i].instances+=1;
                    return true; 
            }
            else{}
       }
       return false;
    } 
}

// iteratively draws cards to screen based on cardsOnScreen.increment
function drawcards(){
    cardCounter=0;
    document.querySelectorAll('.card').forEach(e => e.remove());
    for (let i = 0; i < cardsOnScreen.length; i++){
        for(let p=0; p < cardsOnScreen[i].instances;p++){
            let cardImage = document.createElement('img');
            cardImage.src = cardsOnScreen[i].imageUrl;
            cardImage.setAttribute("class","card")
            cardImage.setAttribute("id",''+cardsOnScreen[i].id+'');
            document.getElementById("cards").appendChild(cardImage);
            cardCounter+=1;
        }
    }
    
}

//Removes 
$(document).on('click',".card" ,function(){
    removeCard(this.id);    
});

function removeCard(id){
    for (let i = 0; i<cardsOnScreen.length;i++){
        if (cardsOnScreen[i].id === id){
            cardsOnScreen[i].instances-=1;
            drawcards();
            break;
        }
        else{}
    }
}

function submitDeck(){
    if(cardCounter==60){
        $.ajax({  
            type: 'POST',
            url: '/deckbuilder/savedeck',
            data: {
                deckName: $('#deckName').val(),
                notes: $('#deckNotes').val(),
                format: $('#format').val(),
                cards: cardsOnScreen,
                },
            success: function() { 
                alert("Save successful")
                location.reload()
            }
        })
    }
    else{
        alert("You need 60 cards to submit the deck!")
    }

    
}
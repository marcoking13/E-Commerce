
var showcase_banner = document.querySelector(".header");
var bubbles = document.getElementsByClassName("bubble_showcase");



var showcase_counter = 1;
var max = 4;


for(var i =0; i <bubbles.length; i++){
  bubbles[i].addEventListener("click",(e)=>{
    toggle_counter(e);
  });
}
function toggle_counter(e){

  var index = e.target.getAttribute("index");

  showcase_counter = index;

  if(showcase_counter < 1){
    showcase_counter = max;
  }else if(showcase_counter > max){
    showcase_counter = index;
  }

  for(var i =0; i <= max; i++){
    showcase_banner.classList.remove(`header--${i}`);
  }

  for(var i =0; i <bubbles.length; i++){
    if(index != bubbles[i].getAttribute("index")){
      bubbles[i].classList.remove("bubble_showcase--active");
    }else if(index == bubbles[i].getAttribute("index")){
      bubbles[i].classList.add("bubble_showcase--active");
    }
  }
  console.log(showcase_counter);
  showcase_banner.classList.add(`header--${showcase_counter}`)

}

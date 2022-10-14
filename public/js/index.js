// Logo Animation
/*const logo = document.querySelectorAll('#logo path');
for (let i = 0; i < logo.length; i++) {
   //console.log(`Letter ${i} length: ${logo[i].getTotalLength()}`);
}
let delay = 0.1;

logo.forEach(i => {
   i.style.strokeDasharray = i.getTotalLength() + 'px';
   i.style.strokeDashoffset = i.getTotalLength() + 'px';
   i.style.animation = `line-anim 2s ease forwards ${delay}s`;
   delay += 0.1;
});


TweenMax.to('#logo', 2.5, {
   scale: 0.5,
   y: -370,
   x: -540,
   delay: 4
});

TweenMax.to('#svg-logo path', 3.5, { stroke: '#f0d245', delay: 2 });
*/

/*TweenMax.to('#nav-bar', 2.5, {
   opacity: 1,
   x: -90,
   delay: 6.2,
   ease: Expo.easeOut
});*/

TweenMax.to('#logo-img-shadow', 2.5, { opacity: 1, delay: 0 });
TweenMax.to('#logo-img', 8, { opacity: 1, delay: 0 });
TweenMax.to('#button', 2.5, {
   y: 0,
   opacity: 1,
   ease: Bounce.easeOut,
   delay: 0
});

const playButton = document.querySelector('#button button');
playButton.addEventListener('click', () => {
   window.location.href = '/play';
});

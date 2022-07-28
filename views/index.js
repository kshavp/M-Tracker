
        let i;
        let a = 0;
        slideshow();

        function slideshow() {
            let slide = document.getElementsByClassName("slides");
            for (i = 0; i < slide.length; i++) {
                slide[i].style.opacity = 0;
            }

            a++;
            if (a > slide.length) {
                a = 1;
            }
            slide[a - 1].style.opacity = 1;
            setTimeout(slideshow, 2000);
        }
 
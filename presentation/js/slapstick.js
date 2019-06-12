const stringifiableFunc = () => {
  const ACTIVATE_KEY = 122;
  const SLAPSTICK_SLIDE_INDEX = 3;

  const revealContainer = document.querySelector('.reveal');

  const convertToCharSpans = (elem) => {
    const treeWalker = document.createTreeWalker(elem, NodeFilter.SHOW_ALL);
    const textNodes = [];
    while (treeWalker.nextNode()) {
      const node = treeWalker.currentNode;
      for (child of node.childNodes) {
        if (child.nodeType === 3) {
          textNodes.push(child);
        }
      }
    }

    textNodes.forEach((textNode) => {
      const spans = [];
      for (const char of textNode.textContent.normalize()) {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = char;
        //span.style.position = 'relative';
        spans.push(span);
      }

      textNode.replaceWith(...spans);
    });
  };

  const getRandomNumber = (order) => (
    Math.ceil(Math.random() * order) * (Math.random() < 0.15 ? -0.2 : 1)
  );

  const letterScrambleIterations = 1;
  const scrambleDuration = 500;
  const scheduleLetterScramble = (elem) => {
    let count = 0;

    return new Promise((resolve) => {
      const evtHandler = ({ keyCode }) => {
        if (keyCode !== ACTIVATE_KEY) {
          return;
        }

        revealContainer.classList.add('slapstick', 'scramble');

        if (!count) {
          elem.style.position = 'absolute';
          elem.style.top = 0;
        }

        /* Lock the handler. */
        document.removeEventListener('keypress', evtHandler);

        const width = window.outerWidth;
        const height = window.outerHeight;
        const rawChars = elem.querySelectorAll('.char');
        const chars = Array.prototype.slice.call(rawChars);
        chars.forEach((char) => {
          char.style.position = 'absolute';
          Velocity(char, {
            left: `${getRandomNumber(width)}px`,
            top: `${getRandomNumber(height)}px`,
          }, scrambleDuration);
        });

        setTimeout(() => {
          count += 1;

          /* Unlock the handler if the count has not yet been reached. */
          if (count < letterScrambleIterations) {
            document.addEventListener('keypress', evtHandler);
          } else {
            document.removeEventListener('keypress', evtHandler);
            return resolve();
          }
        }, scrambleDuration + 1);

        return false;
      };

      document.addEventListener('keypress', evtHandler);
    });
  };

  const fallDuration = 10000;
  const letterBounces = 4;
  const scheduleLetterFall = (elem) => {
    return new Promise((resolve) => {
      const evtHandler = ({ keyCode }) => {
        if (keyCode !== ACTIVATE_KEY) {
          return;
        }
        
        revealContainer.classList.remove('scramble');
        revealContainer.classList.add('fall');
        
        elem.style.position = 'absolute';
        elem.style.top = 0;
        
        document.removeEventListener('keypress', evtHandler);
        
        const rawChars = elem.querySelectorAll('.char');
        const chars = Array.prototype.slice.call(rawChars);
        let finishedRatio;
        let count = 0;
        for (; count < letterBounces; count += 1) {
          const height = window.innerHeight;
          
          finishedRatio = letterScrambleIterations / count;
          
          chars.forEach((char) => {
            const adjustedDuration = fallDuration * (char.offsetHeight / height);
            char.style.position = 'absolute';
            console.log(count % 2 ?
              `${getRandomNumber(height / (1 / finishedRatio) * 0.8)}px` :
              `${height + 50}px`);
            setTimeout(() => {
              Velocity(
                char,
                {
                  top: count % 2 ?
                    `${getRandomNumber(height / (1 / finishedRatio) * 0.8)}px` :
                    `${height + 50}px`,

                  //rotateZ: `${Math.random() > 0.5 ? '+' : '-'}=${Math.ceil(getRandomNumber(10))}deg`,
                },
                adjustedDuration,
                [ Math.random(1 / finishedRatio) * 200, 20 ],
              );
            }, fallDuration * finishedRatio + count); 

            /* Unlock the handler if the count has not yet been reached. */
            if (count < letterBounces) {
              document.addEventListener('keypress', evtHandler);
            } else {
              document.removeEventListener('keypress', evtHandler);
              return resolve();
            }
          });

          /* Unlock the handler if the count has not yet been reached. */
          if (count < letterBounces) {
            document.addEventListener('keypress', evtHandler);
          } else {
            document.removeEventListener('keypress', evtHandler);
            return resolve();
          }
        }

        return false;
      };

      document.addEventListener('keypress', evtHandler);
    });
  };

  const scheduleFire = (elem) => {
    return Promise.resolve();
  };

  const scheduleExplosion = (elem) => {
    return Promise.resolve();
  };

  const scheduleSlideChange = (elem) => {
    return Promise.resolve();
  };

  const scheduleEvents = async (elem) => {
    await scheduleLetterScramble(elem);
    await scheduleLetterFall(elem);
    await scheduleFire(elem);
    await scheduleExplosion(elem);
    await scheduleSlideChange(elem);
  };

  Reveal.addEventListener('slidechanged', ({
    currentSlide,
    indexh,
  }) => {
    if (indexh === SLAPSTICK_SLIDE_INDEX) {
      convertToCharSpans(currentSlide);

      scheduleEvents(currentSlide).then(
        console.log.bind(console, 'All done!'),
        console.error.bind(console),
      );
    }
  });
};

stringifiableFunc();

// More info about config & dependencies:
// - https://github.com/hakimel/reveal.js#configuration
// - https://github.com/hakimel/reveal.js#dependencies
Reveal.initialize({
  dependencies: [
    { src: 'plugin/markdown/marked.js' },
    { src: 'plugin/markdown/markdown.js' },
    {
      src: 'plugin/notes/notes.js',
      async: true,
    },

    {
      src: 'plugin/highlight/highlight.js',
      async: true,
    },
  ],
});

const ACTIVATE_KEY = 122;
const SPACE_KEY = 32;

const stringifiableFunc = () => {
  const removeRevealSpaceAction = () => Reveal.configure({
    keyboard: { [SPACE_KEY]: null },
  });

  const restoreRevealSpaceAction = () => Reveal.configure({
    keyboard: { [SPACE_KEY]: 'next' },
  });

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

  const letterScrambleIterations = 10;
  const scrambleDuration = 500;
  const scheduleLetterScramble = (elem) => {
    let count = 0;

    return new Promise((resolve) => {
      const evtHandler = ({ keyCode }) => {
        if (keyCode !== ACTIVATE_KEY) {
          return;
        }

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
          if (count <= letterScrambleIterations) {
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

  const letterFallIterations = 1;
  const scheduleLetterFall = (elem) => {
    let count = 0;

    return new Promise((resolve) => {
      const evtHandler = ({ keyCode }) => {
        if (keyCode !== ACTIVATE_KEY) {
          return;
        }

        if (!count) {
          elem.style.position = 'absolute';
          elem.style.top = 0;
        }

        document.removeEventListener('keypress', evtHandler);
  
        const height = window.innerHeight;
        const rawChars = elem.querySelectorAll('.char');
        const chars = Array.prototype.slice.call(rawChars);
        chars.forEach((char) => {
          char.style.position = 'absolute';
          Velocity(char, {
            ...(count ? { left: `${getRandomNumber(width)}px` } : null),
            top: count ? `${getRandomNumber(height)}px` : height - 50,
          }, scrambleDuration * char.offsetHeight);
        });

        setTimeout(() => {
          count += 1;

          /* Unlock the handler if the count has not yet been reached. */
          if (count <= letterScrambleIterations) {
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
    await scheduleExplosion();
    await scheduleSlideChange();
  };

  Reveal.addEventListener('slidechanged', ({
    currentSlide,
    indexh,
  }) => {
    if (indexh === 1) {
      convertToCharSpans(currentSlide);

      scheduleEvents(currentSlide).then(
        console.log.bind(console, 'All done!'),
        console.error.bind(console),
      );
    }
  });
};

stringifiableFunc();

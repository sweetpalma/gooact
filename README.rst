======
Gooact
======

    Copyright 2018 SweetPalma <sweet.palma@yandex.ru>

Own React in 160 lines of JavaScript.

Introduction
============
React is a great library — many developers instantly fell in love with it due to simplicity, performance and declarative way of doing things. But personally I have a specific reason what makes it so special for me — and that’s how it works under the hood. I find ideas that stand behind React simple yet strangely fascinating — and I believe that understanding its core principles would help you writing faster and safer code.

So I write a Medium article where how to write a fully functional React clone, including Component API and own Virtual DOM implementation. This is a public repository of Gooact itself.

Installation & Usage
====================
This is a standalone version of Gooact - it can be installed with NPM:

.. code-block:: 
	
	npm install sweetpalma/gooact

And used just as a regular JavaScript library:

.. code-block:: javascript

	import Gooact, {render, Component} from 'gooact';
	
Due to its nature, Gooact can consume JSX - just don't forget to hook up the Babel together with React preset:

.. code-block:: javascript

	/** @jsx Gooact.createElement */
	render(<div>Hello World!</div>, document.body);

License
=======
Gooact is licensed under the MIT License, what allows you to use it for basically anything absolutely for free. It would be great if somebody will find it useful.

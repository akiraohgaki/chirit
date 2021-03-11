export const reset = `
:host {
    display: block;
}

:host *,
:host *::before,
:host *::after {
    box-sizing: border-box;
}

h1,
h2,
h3 {
    margin: 1rem 0;
    font-size: 1.4rem;
}

h4,
h5,
h6 {
    margin: 1rem 0;
    font-size: 1rem;
}

p {
    margin: 1rem 0;
}

a {
    color: inherit;
    text-decoration: none;
}
a:hover {
    text-decoration: underline;
}

img {
    display: inline-block;
}

input {
    -moz-appearance: none;
    -webkit-appearance: none;
    appearance: none;
    outline: none;
    line-height: 1;
    font-size: 1rem;
}
`;

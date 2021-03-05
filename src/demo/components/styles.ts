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
    font-size: 1.4rem;
}

h4,
h5,
h6 {
    font-size: 1rem;
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

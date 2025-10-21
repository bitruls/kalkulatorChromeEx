const display = document.getElementById("display");
const buttons = document.querySelectorAll("button");

let expression = "";

// --- Hjelpefunksjoner ---
function isOperator(ch) {
  return ch === "+" || ch === "-" || ch === "*" || ch === "/";
}

function tokenize(expr) {
  // Bytt komma til punktum og fjern mellomrom
  expr = expr.replace(/,/g, ".").replace(/\s+/g, "");
  if (!expr) return [];

  // Bare lovlige tegn
  if (!/^[\d.+\-*/]+$/.test(expr)) throw new Error("Ugyldige tegn");

  const tokens = [];
  let num = "";

  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];

    if ((ch >= "0" && ch <= "9") || ch === ".") {
      num += ch;
    } else if (isOperator(ch)) {
      if (num) {
        tokens.push(num);
        num = "";
      }
      tokens.push(ch);
    } else {
      throw new Error("Ugyldig tegn");
    }
  }
  if (num) tokens.push(num);

  return tokens;
}

function toRPN(tokens) {
  // Shunting-yard for + - * /
  const output = [];
  const ops = [];
  const prec = { "+": 1, "-": 1, "*": 2, "/": 2 };

  for (const t of tokens) {
    if (!isNaN(t)) {
      output.push(t);
    } else if (isOperator(t)) {
      while (ops.length && prec[ops[ops.length - 1]] >= prec[t]) {
        output.push(ops.pop());
      }
      ops.push(t);
    }
  }
  while (ops.length) output.push(ops.pop());
  return output;
}

function evalRPN(rpn) {
  const st = [];
  for (const t of rpn) {
    if (!isNaN(t)) {
      st.push(parseFloat(t));
    } else {
      const b = st.pop();
      const a = st.pop();
      if (a === undefined || b === undefined) throw new Error("Ugyldig uttrykk");
      switch (t) {
        case "+": st.push(a + b); break;
        case "-": st.push(a - b); break;
        case "*": st.push(a * b); break;
        case "/":
          if (b === 0) throw new Error("Kan ikke dele på 0");
          st.push(a / b);
          break;
      }
    }
  }
  if (st.length !== 1) throw new Error("Ugyldig uttrykk");
  return st[0];
}

function calculate(expr) {
  const tokens = tokenize(expr);
  if (tokens.length === 0) return "";
  const rpn = toRPN(tokens);
  const result = evalRPN(rpn);
  return result.toString();
}

// --- UI-logikk ---
buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const value = button.textContent;

    if (value === "C") {
      expression = "";
      display.value = "";
      return;
    }

    if (value === "=") {
      try {
        const result = calculate(expression);
        expression = result;
        display.value = expression;
      } catch (e) {
        display.value = "Feil!";
        expression = "";
      }
      return;
    }

    // Unngå doble operatorer (f.eks. "5++")
    if (isOperator(value)) {
      if (!expression) return; // ikke start med operator
      const last = expression[expression.length - 1];
      if (isOperator(last)) {
        // bytt ut siste operator med den nye
        expression = expression.slice(0, -1) + value;
      } else {
        expression += value;
      }
    } else {
      expression += value;
    }

    display.value = expression;
  });
});

// (Valgfritt) tastaturstøtte
document.addEventListener("keydown", (e) => {
  const key = e.key;

  if (key === "Enter" || key === "=") {
    try {
      const result = calculate(expression);
      expression = result;
      display.value = expression;
    } catch {
      display.value = "Feil!";
      expression = "";
    }
    e.preventDefault();
  } else if (key === "Backspace") {
    expression = expression.slice(0, -1);
    display.value = expression;
    e.preventDefault();
  } else if (key === "Escape") {
    expression = "";
    display.value = "";
    e.preventDefault();
  } else if (/[0-9.+\-/*,]/.test(key)) {
    // Støtter også komma
    expression += key;
    display.value = expression;
    e.preventDefault();
  }
});

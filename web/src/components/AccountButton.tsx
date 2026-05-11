"use client";

import { useEffect, useState } from "react";

const accountSessionKey = "east-meets-nash:account-session";

export function AccountButton() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    function syncSession() {
      setLoggedIn(localStorage.getItem(accountSessionKey) === "true");
    }

    syncSession();
    window.addEventListener("storage", syncSession);
    window.addEventListener("east-meets-nash:session-change", syncSession);
    return () => {
      window.removeEventListener("storage", syncSession);
      window.removeEventListener("east-meets-nash:session-change", syncSession);
    };
  }, []);

  function handleClick() {
    if (loggedIn) {
      window.location.href = "/feed";
      return;
    }

    localStorage.setItem(accountSessionKey, "true");
    window.dispatchEvent(new CustomEvent("east-meets-nash:session-change"));
    setLoggedIn(true);
  }

  return (
    <button aria-pressed={loggedIn} className="atxp-button" onClick={handleClick} type="button">
      {loggedIn ? "Account" : "Login"}
    </button>
  );
}

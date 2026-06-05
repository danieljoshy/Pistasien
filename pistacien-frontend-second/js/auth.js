/* ── AUTHENTICATION PAGE JS ─────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  const formContainers = document.querySelectorAll(".auth-pane");
  const tabs           = document.querySelectorAll(".auth-tab");
  const tabSlider      = document.querySelector(".auth-tab-slider");
  const authTitle      = document.getElementById("auth-title");
  const authSwitchText = document.getElementById("auth-switch-text");

  const tabMeta = {
    login:  { title: "Sign In",        switchHtml: 'Don\'t have an account? <a href="#" class="auth-switch-link" data-tab="signup">Sign Up</a>' },
    signup: { title: "Create Account", switchHtml: 'Already have an account? <a href="#" class="auth-switch-link" data-tab="login">Sign In</a>'  },
    otp:    { title: "Verify Email",   switchHtml: 'Want to go back? <a href="#" class="auth-switch-link" data-tab="login">Sign In</a>' }
  };

  /* ── ENTRANCE ANIMATION ──────────────────────────────── */
  const entranceTl = gsap.timeline({ defaults: { ease: "power3.out", force3D: true } });

  entranceTl
    /* Card */
    .fromTo(".auth-card",
      { opacity: 0, y: 28, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: "power2.out" }, 0)

    /* Left panel */
    .fromTo(".auth-back-home",
      { x: -18, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.9 }, 0.45)
    .fromTo(".auth-brand",
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9 }, 0.55)
    .fromTo(".auth-left-heading",
      { y: 28, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.0 }, 0.65)
    .fromTo(".auth-left-sub",
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.85 }, 0.78)
    .fromTo(".auth-left-tagline",
      { opacity: 0 },
      { opacity: 1, duration: 0.8 }, 0.9)

    /* Right panel */
    .fromTo(".auth-lang",
      { y: -10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7 }, 0.5)
    .fromTo(".auth-header",
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.85 }, 0.65)
    .fromTo(".auth-tabs",
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.75 }, 0.75)
    .fromTo(
      "#pane-login .auth-input-group, #pane-login .auth-options, #pane-login .auth-checkbox-label, #pane-login .auth-btn-primary",
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.09, duration: 0.65 }, 0.85)
    .fromTo(".auth-separator",
      { opacity: 0 },
      { opacity: 1, duration: 0.75 }, 1.15)
    .fromTo(".auth-socials",
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.65 }, 1.25)
    .fromTo(".auth-switch",
      { y: 8, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.65 }, 1.35);

  /* ── TAB SLIDER ──────────────────────────────────────── */
  function updateSlider(activeTab) {
    if (!tabSlider) return;
    gsap.to(tabSlider, {
      x: activeTab.offsetLeft,
      width: activeTab.offsetWidth,
      duration: 0.38,
      ease: "power3.out"
    });
  }

  const initialTab = document.querySelector(".auth-tab.active");
  if (initialTab) updateSlider(initialTab);

  /* ── TAB SWITCH ──────────────────────────────────────── */
  function switchTab(targetId) {
    if (!tabMeta[targetId]) return;

    /* Hide/show tab header in OTP mode */
    const authTabs = document.querySelector(".auth-tabs");
    if (authTabs) {
      authTabs.style.display = targetId === "otp" ? "none" : "flex";
    }

    /* Update tab buttons */
    tabs.forEach(t => {
      const isActive = t.getAttribute("data-tab") === targetId;
      t.classList.toggle("active", isActive);
      t.setAttribute("aria-selected", String(isActive));
    });

    const newActiveTab = document.querySelector(`.auth-tab[data-tab="${targetId}"]`);
    if (newActiveTab) updateSlider(newActiveTab);

    /* Update heading + switch link */
    if (authTitle)      authTitle.textContent  = tabMeta[targetId].title;
    if (authSwitchText) authSwitchText.innerHTML = tabMeta[targetId].switchHtml;
    bindSwitchLinks();

    /* Animate panes — sequenced timeline: out → swap → in */
    const wrapper = document.querySelector(".auth-panes-wrapper");
    const outPane = document.querySelector(".auth-pane.active");
    const inPane  = document.getElementById(`pane-${targetId}`);

    if (!outPane || !inPane || outPane === inPane) return;

    // Lock wrapper height so it doesn't jump during swap
    gsap.set(wrapper, { height: wrapper.offsetHeight, overflow: "hidden" });

    // Measure incoming pane height while it's off-screen
    gsap.set(inPane, { display: "flex", visibility: "hidden", position: "absolute", pointerEvents: "none" });
    const incomingH = inPane.offsetHeight;
    gsap.set(inPane, { display: "none", visibility: "visible", position: "", pointerEvents: "" });

    const tl = gsap.timeline({
      onComplete: () => gsap.set(wrapper, { clearProps: "height,overflow" })
    });

    // 1. Slide + fade out current pane children
    tl.to(Array.from(outPane.children), {
      y: -10, opacity: 0,
      stagger: { each: 0.025, from: "start" },
      duration: 0.22,
      ease: "power2.in"
    });

    // 2. Animate wrapper height to match incoming pane
    tl.to(wrapper, { height: incomingH, duration: 0.28, ease: "power2.inOut" }, 0.14);

    // 3. Swap panes at the crossover point
    tl.call(() => {
      outPane.classList.remove("active");
      gsap.set(outPane,                        { display: "none" });
      gsap.set(Array.from(outPane.children),   { clearProps: "y,opacity" });
      inPane.classList.add("active");
      gsap.set(inPane, { display: "flex" });
    }, null, 0.36);

    // 4. Stagger in incoming pane children
    tl.fromTo(
      Array.from(inPane.children),
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.07, duration: 0.44, ease: "power2.out" },
      0.38
    );
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetId = tab.getAttribute("data-tab");
      if (tab.classList.contains("active")) return;
      switchTab(targetId);
    });
  });

  /* ── SWITCH LINKS (bottom) ───────────────────────────── */
  function bindSwitchLinks() {
    document.querySelectorAll(".auth-switch-link").forEach(link => {
      link.addEventListener("click", e => {
        e.preventDefault();
        const targetId = link.getAttribute("data-tab");
        if (targetId) switchTab(targetId);
      });
    });
  }
  bindSwitchLinks();

  /* ── PASSWORD VISIBILITY TOGGLE ─────────────────────── */
  document.querySelectorAll(".auth-pw-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const group     = btn.closest(".auth-input-group--pw");
      const input     = group.querySelector(".auth-input");
      const eyeOn     = btn.querySelector(".eye-icon");
      const eyeOff    = btn.querySelector(".eye-off-icon");
      const isHidden  = input.type === "password";

      input.type          = isHidden ? "text"    : "password";
      eyeOn.style.display  = isHidden ? "none"    : "block";
      eyeOff.style.display = isHidden ? "block"   : "none";
      btn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
    });
  });

  /* ── HAS-VALUE CLASS (autofill compat) ───────────────── */
  const inputs = document.querySelectorAll(".auth-input");
  setTimeout(() => {
    inputs.forEach(input => {
      if (input.value.trim() !== "") input.classList.add("has-value");
    });
  }, 150);

  inputs.forEach(input => {
    input.addEventListener("input", () => {
      input.classList.toggle("has-value", input.value.trim() !== "");
    });
  });  /* ── API INTEGRATION (FORMS) ───────────────────────── */
  const loginForm = document.getElementById("pane-login");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = loginForm.querySelector(".auth-btn-primary");
      const btnTextNode = btn.querySelector(".btn-text") || btn;
      const originalText = btnTextNode.textContent;
      btnTextNode.textContent = "Loading...";
      btn.disabled = true;
      
      const inputs = loginForm.querySelectorAll(".auth-input");
      const email = inputs[0]?.value;
      const password = inputs[1]?.value;
      
      try {
        if (window.apiLogin) {
          const result = await window.apiLogin(email, password);
          console.log("Login success:", result);
          // Redirect immediately to index.html with no alert popup
          window.location.href = "index.html";
        } else {
          // Fallback if api.js isn't loaded
          console.log("Mock login for:", email);
          setTimeout(() => {
            window.showToast("Mock Login complete", "success");
          }, 500);
        }
      } catch (err) {
        console.error("Login failed:", err);
        if (err.status === 403 && err.data && err.data.userId) {
          // Email is not verified. Redirect to OTP verification screen.
          document.getElementById("otp-userid").value = err.data.userId;
          switchTab("otp");
          window.showToast("Please verify your email address. An OTP code has been sent to your email.", "warning");
        } else {
          window.showToast(err.message || "Login failed. Please check your credentials.", "error");
        }
      } finally {
        btnTextNode.textContent = originalText;
        btn.disabled = false;
      }
    });
  }
  
  const signupForm = document.getElementById("pane-signup");
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = signupForm.querySelector(".auth-btn-primary");
      const btnTextNode = btn.querySelector(".btn-text") || btn;
      const originalText = btnTextNode.textContent;
      btnTextNode.textContent = "Loading...";
      btn.disabled = true;
      
      const inputs = signupForm.querySelectorAll(".auth-input");
      const name = inputs[0]?.value;
      const email = inputs[1]?.value;
      const password = inputs[2]?.value;
      const data = { name, email, password };
      
      try {
        if (window.apiSignup) {
          const result = await window.apiSignup(data);
          console.log("Signup success:", result);
          if (result.userId) {
            document.getElementById("otp-userid").value = result.userId;
            switchTab("otp");
            window.showToast("Account created successfully! Please enter the 6-digit OTP sent to your email to verify.", "success");
          } else {
            window.showToast("Registration successful. Please log in.", "success");
            switchTab("login");
          }
        } else {
          console.log("Mock signup for:", email);
          setTimeout(() => {
            window.showToast("Mock Signup complete", "success");
          }, 500);
        }
      } catch (err) {
        console.error("Signup failed:", err);
        window.showToast(err.message || "Signup failed. Please try again.", "error");
      } finally {
        btnTextNode.textContent = originalText;
        btn.disabled = false;
      }
    });
  }

  const otpForm = document.getElementById("pane-otp");
  if (otpForm) {
    otpForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = otpForm.querySelector(".auth-btn-primary");
      const btnTextNode = btn.querySelector(".btn-text") || btn;
      const originalText = btnTextNode.textContent;
      btnTextNode.textContent = "Verifying...";
      btn.disabled = true;

      const userId = document.getElementById("otp-userid").value;
      const otp = document.getElementById("verification-otp").value;

      try {
        if (window.apiVerifyEmail) {
          const result = await window.apiVerifyEmail(userId, otp);
          console.log("OTP Verification success:", result);
          // Redirect immediately to login page with no alert popup
          window.location.href = "auth.html";
        } else {
          window.showToast("apiVerifyEmail utility is missing.", "error");
        }
      } catch (err) {
        console.error("OTP Verification failed:", err);
        window.showToast(err.message || "Verification failed. Please check the code.", "error");
      } finally {
        btnTextNode.textContent = originalText;
        btn.disabled = false;
      }
    });
  }

  const resendBtn = document.getElementById("resend-otp-btn");
  if (resendBtn) {
    resendBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      const userId = document.getElementById("otp-userid").value;
      if (!userId) {
        window.showToast("User session not found. Please try logging in again.", "warning");
        return;
      }

      resendBtn.style.pointerEvents = "none";
      resendBtn.style.opacity = "0.5";
      resendBtn.textContent = "Sending...";

      try {
        if (window.apiResendOTP) {
          await window.apiResendOTP(userId);
          window.showToast("A new verification code has been sent to your email.", "success");
        }
      } catch (err) {
        console.error("Resending OTP failed:", err);
        window.showToast(err.message || "Failed to resend code.", "error");
      } finally {
        resendBtn.style.pointerEvents = "auto";
        resendBtn.style.opacity = "1";
        resendBtn.textContent = "Resend Code";
      }
    });
  }

});

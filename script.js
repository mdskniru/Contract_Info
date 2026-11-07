/* ============================================================
     EDIT THIS BLOCK — your details go here.
     ============================================================ */
      const PROFILE = {
        name: "Md Shahariar Khan Niru",
        role: "Software Developer",
        baseLocation: "Mirpur, Bangladesh",
        baseCoordinates: { lat: 23.8041, lon: 90.3686 },
        email: "mdskniru@gmail.com",
        phone: "01961736749",
        phoneInternational: "+8801961736749",
        facebook: "https://www.facebook.com/mdskniru",
        linkedin: "https://www.linkedin.com/in/md-shahariar-khan-356312392/",
        github: "https://github.com/mdskniru",
      };
      /* ============================================================ */

      const $ = (id) => document.getElementById(id);

      // --- Profile wiring ---
      $("name").textContent = PROFILE.name;
      $("footer-name").textContent = PROFILE.name;
      document.title = `${PROFILE.name} — ${PROFILE.role}`;
      $("value-email").textContent = PROFILE.email;
      $("value-phone").textContent = PROFILE.phone;
      $("location-name").textContent = PROFILE.baseLocation;
      $("year").textContent = new Date().getFullYear();

      $("link-facebook").href = PROFILE.facebook;
      $("link-linkedin").href = PROFILE.linkedin;
      $("link-github").href = PROFILE.github;
      $("link-email").href = `mailto:${PROFILE.email}`;
      $("link-phone").href = `tel:${PROFILE.phoneInternational}`;

      // --- Copy to clipboard ---
      async function copyText(text, button) {
        let copied = false;
        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            copied = true;
          }
        } catch {
          copied = false;
        }

        if (!copied) {
          const area = document.createElement("textarea");
          area.value = text;
          area.setAttribute("readonly", "");
          area.style.position = "fixed";
          area.style.opacity = "0";
          document.body.appendChild(area);
          area.select();
          try {
            copied = document.execCommand("copy");
          } catch {
            copied = false;
          }
          area.remove();
        }

        if (!copied) return;

        button.classList.add("done");
        const original = button.getAttribute("aria-label");
        button.setAttribute("aria-label", "Copied");
        setTimeout(() => {
          button.classList.remove("done");
          button.setAttribute("aria-label", original);
        }, 1600);
      }

      $("copy-email").addEventListener("click", (e) =>
        copyText(PROFILE.email, e.currentTarget),
      );
      $("copy-phone").addEventListener("click", (e) =>
        copyText(PROFILE.phone, e.currentTarget),
      );

      // --- Map helpers ---
      const map = $("map");
      const placeholder = $("map-placeholder");
      const statusEl = $("location-status");
      const coordsEl = $("location-coords");
      const locateBtn = $("locate");
      const openMap = $("open-map");

      function setStatus(text, live = false) {
        statusEl.textContent = text;
        statusEl.classList.toggle("live", live);
      }

      function renderMap(lat, lon, zoom = 15) {
        const iframe = document.createElement("iframe");
        iframe.src = `https://maps.google.com/maps?q=${lat},${lon}&z=${zoom}&output=embed`;
        iframe.title = "Google Map of the selected location";
        iframe.loading = "lazy";
        map.querySelectorAll("iframe").forEach((el) => el.remove());
        placeholder.hidden = true;
        map.appendChild(iframe);
        openMap.href = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
      }

      function showCoords(lat, lon, accuracy, place) {
        const accText = Number.isFinite(accuracy)
          ? ` · ±${Math.round(accuracy)} m`
          : "";
        coordsEl.replaceChildren();
        if (place) {
          const placeLabel = document.createElement("b");
          placeLabel.textContent = place;
          coordsEl.append(placeLabel, document.createTextNode(" · "));
        }
        coordsEl.append(
          document.createTextNode(
            `${lat.toFixed(5)}, ${lon.toFixed(5)}${accText}`,
          ),
        );
      }

      // Show the configured city without depending on a geocoding request.
      renderMap(PROFILE.baseCoordinates.lat, PROFILE.baseCoordinates.lon, 12);
      showCoords(
        PROFILE.baseCoordinates.lat,
        PROFILE.baseCoordinates.lon,
        null,
        PROFILE.baseLocation,
      );
      setStatus("Map · base");

      // --- Live geolocation ---
      locateBtn.addEventListener("click", () => {
        if (!("geolocation" in navigator)) {
          setStatus("GPS · unsupported");
          coordsEl.textContent =
            "Geolocation is not supported by this browser.";
          return;
        }

        if (!window.isSecureContext) {
          setStatus("GPS · secure connection required");
          coordsEl.textContent =
            "Live location requires HTTPS or a local development server.";
          return;
        }

        locateBtn.disabled = true;
        setStatus("GPS · locating…");

        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude, accuracy } = pos.coords;
            renderMap(latitude, longitude, 16);
            showCoords(latitude, longitude, accuracy, "Current location");
            setStatus("GPS · live", true);
            locateBtn.disabled = false;
          },
          (err) => {
            locateBtn.disabled = false;
            const reasons = {
              1: "Permission denied — enable location access in your browser settings.",
              2: "Location unavailable right now. Try again in a moment.",
              3: "The request timed out. Please try again.",
            };
            setStatus("GPS · blocked");
            coordsEl.textContent =
              reasons[err.code] || "Could not read your location.";
          },
          { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
        );
      });


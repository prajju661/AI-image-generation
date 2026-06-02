document.addEventListener('DOMContentLoaded', () => {

  /* --- Navigation & Header --- */
  const header = document.getElementById('main-header');
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Change header appearance on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    menuToggle.classList.toggle('active');
    
    // Animate burger bars
    const spans = menuToggle.querySelectorAll('span');
    if (menuToggle.classList.contains('active')) {
      spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    }
  });

  // Close mobile menu on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      menuToggle.classList.remove('active');
      const spans = menuToggle.querySelectorAll('span');
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    });
  });


  /* --- Counters Animation --- */
  const statNumbers = document.querySelectorAll('.stat-number');
  
  const animateCounters = () => {
    statNumbers.forEach(stat => {
      const targetText = stat.innerText;
      const targetNum = parseFloat(targetText);
      const isDecimal = targetText.includes('.');
      const suffix = targetText.replace(/[0-9.]/g, '');
      
      let count = 0;
      const duration = 1500; // ms
      const startTime = performance.now();

      const updateCount = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing out quadratic
        const easeProgress = progress * (2 - progress);
        const currentVal = easeProgress * targetNum;

        if (isDecimal) {
          stat.innerText = currentVal.toFixed(1) + suffix;
        } else {
          stat.innerText = Math.floor(currentVal) + suffix;
        }

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          stat.innerText = targetText; // Ensure exact final value
        }
      };

      requestAnimationFrame(updateCount);
    });
  };

  // Intersection Observer to trigger counter animation once when visible
  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const statsSection = document.querySelector('.hero-stats');
  if (statsSection) {
    statsObserver.observe(statsSection);
  }


  /* --- Playground / Interactive Sandbox --- */
  const promptInput = document.getElementById('prompt-input');
  const promptChips = document.querySelectorAll('#prompt-chips .chip');
  const styleBtns = document.querySelectorAll('.style-btn');
  const ratioBtns = document.querySelectorAll('.ratio-btn');
  const btnGenerateArt = document.getElementById('btn-generate-art');
  const canvasContainer = document.getElementById('canvas-container');
  const canvasImage = document.getElementById('canvas-image');
  
  // Loader elements
  const loaderStatus = document.getElementById('loader-status');
  const progressFill = document.getElementById('progress-fill');
  const progressPercent = document.getElementById('progress-percent');
  const outputSeed = document.getElementById('output-seed');
  const btnCopyPrompt = document.getElementById('btn-copy-prompt');
  const btnDownloadImg = document.getElementById('btn-download-img');

  // Initial setup state
  let selectedStyle = 'cinematic';
  let selectedRatio = '1:1';
  
  // Define mock images mapped to styles
  const styleImages = {
    cinematic: 'assets/playground_cinematic.png',
    fantasy: 'assets/playground_fantasy.png',
    anime: 'assets/playground_anime.png',
    '3d': 'assets/playground_3d.png'
  };

  // Preset prompts mapped to styles
  const presets = {
    cinematic: {
      prompt: "A futuristic cyberpunk street with glowing neon storefront signs, rain reflections on asphalt, sleek hovercar parked, high-tech cinematic style, photorealistic, 8k resolution",
      seed: "892471902"
    },
    fantasy: {
      prompt: "A majestic floating castle in the sky, huge waterfalls pouring into clouds, soft pink sunset, fantasy digital art, highly detailed, magical lighting",
      seed: "450981773"
    },
    anime: {
      prompt: "Stunning anime style illustration of a girl looking at a giant colorful cosmic galaxy in the night sky, stars, magical atmosphere, Makoto Shinkai style, high detail",
      seed: "128490355"
    },
    '3d': {
      prompt: "A cute explorer robot gardener watering a glowing bioluminescent plant on Mars, Pixar style 3D render, soft ambient lighting, vibrant cosmic colors",
      seed: "338902817"
    }
  };

  // Set default initial prompt
  promptInput.value = presets.cinematic.prompt;

  // Preset chip clicks
  promptChips.forEach(chip => {
    chip.addEventListener('click', () => {
      // Remove active from all chips
      promptChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      
      // Update data
      const prompt = chip.getAttribute('data-prompt');
      const style = chip.getAttribute('data-style');
      
      // Animate typewriting effect in prompt textarea
      typewritePrompt(prompt);
      
      // Activate matching style button
      styleBtns.forEach(btn => {
        if (btn.getAttribute('data-style') === style) {
          btn.click();
        }
      });
    });
  });

  // Typewriting effect simulation
  let typingInterval = null;
  const typewritePrompt = (targetText) => {
    if (typingInterval) clearInterval(typingInterval);
    promptInput.value = "";
    let index = 0;
    
    typingInterval = setInterval(() => {
      if (index < targetText.length) {
        promptInput.value += targetText.charAt(index);
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 10); // Super fast typing
  };

  // Style button selector click
  styleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      styleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedStyle = btn.getAttribute('data-style');
      
      // De-active chips if they don't match the selection
      const activeChip = document.querySelector('#prompt-chips .chip.active');
      if (activeChip && activeChip.getAttribute('data-style') !== selectedStyle) {
        promptChips.forEach(c => {
          if (c.getAttribute('data-style') === selectedStyle) {
            promptChips.forEach(ch => ch.classList.remove('active'));
            c.classList.add('active');
            promptInput.value = presets[selectedStyle].prompt;
          }
        });
      }
    });
  });

  // Aspect ratio clicks
  ratioBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      ratioBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedRatio = btn.getAttribute('data-ratio');
      
      // Update canvas container aspect ratio class
      canvasContainer.className = 'canvas-container';
      if (selectedRatio === '16:9') {
        canvasContainer.classList.add('ratio-16-9');
      } else if (selectedRatio === '9:16') {
        canvasContainer.classList.add('ratio-9-16');
      }
    });
  });

  // Prompt generator progress text phases
  const loadingStatusPhases = [
    { threshold: 0, text: "Initializing forge engine..." },
    { threshold: 20, text: "Analyzing prompt semantics..." },
    { threshold: 45, text: "Injecting stardust latent noise..." },
    { threshold: 70, text: "Refining high-fidelity details..." },
    { threshold: 90, text: "Polishing color gradients..." },
    { threshold: 100, text: "Masterpiece forged!" }
  ];

  // Click Generate Art
  btnGenerateArt.addEventListener('click', () => {
    if (canvasContainer.classList.contains('loading')) return;
    
    // Add loading class to canvas container
    canvasContainer.classList.add('loading');
    btnGenerateArt.disabled = true;
    
    let progress = 0;
    progressFill.style.width = '0%';
    progressPercent.innerText = '0%';
    
    const intervalTime = 40; // Total duration ~ 2.5 seconds
    const progressStep = 1.6;
    
    const generationTimer = setInterval(() => {
      progress += progressStep;
      if (progress >= 100) {
        progress = 100;
      }
      
      progressFill.style.width = `${progress}%`;
      progressPercent.innerText = `${Math.floor(progress)}%`;
      
      // Update loader status text based on progress thresholds
      const currentPhase = loadingStatusPhases.reduce((prev, curr) => {
        return (progress >= curr.threshold) ? curr : prev;
      }, loadingStatusPhases[0]);
      loaderStatus.innerText = currentPhase.text;
      
      if (progress >= 100) {
        clearInterval(generationTimer);
        
        // Load target image
        canvasImage.src = styleImages[selectedStyle];
        
        // Generate new random seed if custom prompt or select preset seed
        const matchedPreset = presets[selectedStyle];
        if (promptInput.value.trim() === matchedPreset.prompt) {
          outputSeed.innerText = matchedPreset.seed;
        } else {
          outputSeed.innerText = Math.floor(Math.random() * 900000000) + 100000000;
        }
        
        // Timeout to reveal image nicely
        setTimeout(() => {
          canvasContainer.classList.remove('loading');
          btnGenerateArt.disabled = false;
        }, 300);
      }
    }, intervalTime);
  });

  // Action: Copy Playground Prompt
  btnCopyPrompt.addEventListener('click', () => {
    const textToCopy = promptInput.value;
    navigator.clipboard.writeText(textToCopy).then(() => {
      const originalSvg = btnCopyPrompt.innerHTML;
      btnCopyPrompt.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00f2fe" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
      btnCopyPrompt.style.borderColor = '#00f2fe';
      setTimeout(() => {
        btnCopyPrompt.innerHTML = originalSvg;
        btnCopyPrompt.style.borderColor = '';
      }, 2000);
    });
  });

  // Action: Download image mockup
  btnDownloadImg.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = canvasImage.src;
    link.download = `ai-world-${selectedStyle}-${selectedRatio.replace(':', '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });


  /* --- Gallery Showcase Filters --- */
  const filterTabs = document.querySelectorAll('.filter-tab');
  const galleryGrid = document.getElementById('gallery-grid');
  const galleryCards = document.querySelectorAll('.gallery-card');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const filterValue = tab.getAttribute('data-filter');
      
      galleryCards.forEach(card => {
        const category = card.getAttribute('data-category');
        
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'block';
          // Force reflow and apply scale fade-in animation
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.9)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // Gallery copy prompt buttons
  const galleryCopyBtns = document.querySelectorAll('.btn-copy-gallery');
  galleryCopyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Avoid card hover overlay trigger glitches
      const promptText = btn.getAttribute('data-prompt');
      
      navigator.clipboard.writeText(promptText).then(() => {
        const originalText = btn.innerText;
        btn.innerText = "Prompt Copied!";
        btn.style.background = "#10b981";
        
        setTimeout(() => {
          btn.innerText = originalText;
          btn.style.background = "";
        }, 2000);
      });
    });
  });


  /* --- Pricing Toggle (Billing Cycle) --- */
  const billingToggle = document.getElementById('billing-toggle');
  const labelMonthly = document.getElementById('label-monthly');
  const labelYearly = document.getElementById('label-yearly');
  
  // Pricing elements
  const pricePro = document.getElementById('price-pro');
  const durationPro = document.getElementById('duration-pro');
  const priceEnterprise = document.getElementById('price-enterprise');
  const durationEnterprise = document.getElementById('duration-enterprise');

  // Toggle state
  let isYearly = false;
  labelMonthly.classList.add('active');

  const updatePricingDisplay = () => {
    if (isYearly) {
      billingToggle.classList.add('yearly');
      labelMonthly.classList.remove('active');
      labelYearly.classList.add('active');
      
      // Animate price change
      pricePro.style.opacity = 0;
      priceEnterprise.style.opacity = 0;
      
      setTimeout(() => {
        pricePro.innerText = "15";
        priceEnterprise.innerText = "39";
        
        pricePro.style.opacity = 1;
        priceEnterprise.style.opacity = 1;
      }, 150);
    } else {
      billingToggle.classList.remove('yearly');
      labelMonthly.classList.add('active');
      labelYearly.classList.remove('active');
      
      // Animate price change
      pricePro.style.opacity = 0;
      priceEnterprise.style.opacity = 0;
      
      setTimeout(() => {
        pricePro.innerText = "19";
        priceEnterprise.innerText = "49";
        
        pricePro.style.opacity = 1;
        priceEnterprise.style.opacity = 1;
      }, 150);
    }
  };

  billingToggle.addEventListener('click', () => {
    isYearly = !isYearly;
    updatePricingDisplay();
  });

  labelMonthly.addEventListener('click', () => {
    isYearly = false;
    updatePricingDisplay();
  });

  labelYearly.addEventListener('click', () => {
    isYearly = true;
    updatePricingDisplay();
  });


  /* --- FAQ Accordion --- */
  const faqTriggers = document.querySelectorAll('.faq-trigger');

  faqTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const panel = trigger.nextElementSibling;
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      
      // Collapse all other panels first
      faqTriggers.forEach(otherTrigger => {
        if (otherTrigger !== trigger) {
          otherTrigger.setAttribute('aria-expanded', 'false');
          otherTrigger.nextElementSibling.style.maxHeight = null;
        }
      });
      
      // Toggle current panel
      if (!isExpanded) {
        trigger.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + "px";
      } else {
        trigger.setAttribute('aria-expanded', 'false');
        panel.style.maxHeight = null;
      }
    });
  });


  /* --- Newsletter Form Submission --- */
  const newsletterForm = document.getElementById('newsletter-form');
  const newsletterEmail = document.getElementById('newsletter-email');
  const subscriptionStatus = document.getElementById('subscription-status');
  const btnSubscribe = document.getElementById('btn-subscribe');

  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const emailVal = newsletterEmail.value.trim();
    if (!emailVal) return;
    
    // Simulate server subscription processing
    btnSubscribe.disabled = true;
    btnSubscribe.innerText = "Sending...";
    subscriptionStatus.className = "subscription-status";
    subscriptionStatus.innerText = "";
    
    setTimeout(() => {
      btnSubscribe.disabled = false;
      btnSubscribe.innerText = "Get Invitation";
      newsletterEmail.value = "";
      
      subscriptionStatus.classList.add('success');
      subscriptionStatus.innerText = `✨ Invitation sent to ${emailVal}! Welcome aboard.`;
      
      // Clear toast after 5 seconds
      setTimeout(() => {
        subscriptionStatus.style.opacity = 0;
        setTimeout(() => {
          subscriptionStatus.innerText = "";
          subscriptionStatus.style.opacity = 1;
          subscriptionStatus.className = "subscription-status";
        }, 300);
      }, 5000);
    }, 1200);
  });

});

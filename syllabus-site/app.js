(function initSyllabusApp() {
  const data = window.SYLLABUS_DATA;

  if (!data || !Array.isArray(data.sections)) {
    return;
  }

  const refs = {
    courseCodeYear: document.getElementById("courseCodeYear"),
    courseTitle: document.getElementById("courseTitle"),
    courseSubtitle: document.getElementById("courseSubtitle"),
    courseInstructor: document.getElementById("courseInstructor"),
    courseOverview: document.getElementById("courseOverview"),
    sections: document.getElementById("sections"),
    searchInput: document.getElementById("searchInput"),
    coreOnlyInput: document.getElementById("coreOnlyInput"),
    resultCount: document.getElementById("resultCount"),
    noResults: document.getElementById("noResults"),
  };

  const state = {
    query: "",
    coreOnly: false,
    sections: [],
  };

  renderCourseHeader();
  renderSections();
  bindControls();
  applyFilters();

  function renderCourseHeader() {
    const course = data.course || {};
    refs.courseCodeYear.textContent = `${course.code || ""} - ${course.academicYear || ""}`;
    refs.courseTitle.textContent = course.title || "";
    refs.courseSubtitle.textContent = course.subtitle || "";
    refs.courseInstructor.textContent = course.instructor ? `Instructor: ${course.instructor}` : "";

    refs.courseOverview.innerHTML = "";
    const overview = Array.isArray(course.overview) ? course.overview : [];
    overview.forEach((text) => {
      const p = document.createElement("p");
      p.textContent = text;
      refs.courseOverview.appendChild(p);
    });
  }

  function renderSections() {
    refs.sections.innerHTML = "";

    data.sections.forEach((section, sectionIndex) => {
      const sectionCard = document.createElement("article");
      sectionCard.className = "section-card";
      sectionCard.dataset.sectionId = section.id || `section-${sectionIndex + 1}`;

      const sectionButton = document.createElement("button");
      sectionButton.type = "button";
      sectionButton.className = "section-toggle";

      const panelId = `panel-${sectionCard.dataset.sectionId}`;
      sectionButton.setAttribute("aria-controls", panelId);

      const sectionMain = document.createElement("div");
      sectionMain.className = "section-main";

      const sectionTitle = document.createElement("h2");
      sectionTitle.className = "section-title";
      sectionTitle.textContent = section.title;

      const sectionCount = document.createElement("span");
      sectionCount.className = "section-count";

      const sectionChevron = document.createElement("span");
      sectionChevron.className = "section-chevron";
      sectionChevron.setAttribute("aria-hidden", "true");
      sectionChevron.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

      sectionMain.appendChild(sectionTitle);
      sectionMain.appendChild(sectionCount);
      sectionButton.appendChild(sectionMain);
      sectionButton.appendChild(sectionChevron);

      const panel = document.createElement("div");
      panel.className = "section-panel";
      panel.id = panelId;

      const paperList = document.createElement("ul");
      paperList.className = "paper-list";

      const papers = Array.isArray(section.papers) ? section.papers : [];
      const paperNodes = papers.map((paper, paperIndex) => {
        const node = createPaperNode(paper, sectionCard.dataset.sectionId, paperIndex);
        paperList.appendChild(node.root);
        return node;
      });

      panel.appendChild(paperList);
      sectionCard.appendChild(sectionButton);
      sectionCard.appendChild(panel);
      refs.sections.appendChild(sectionCard);

      const sectionState = {
        root: sectionCard,
        button: sectionButton,
        panel,
        count: sectionCount,
        papers: paperNodes,
        totalCount: paperNodes.length,
        expanded: true,
        setExpanded(expanded) {
          this.expanded = Boolean(expanded);
          this.button.setAttribute("aria-expanded", this.expanded ? "true" : "false");
          this.root.classList.toggle("is-open", this.expanded);
        },
      };

      sectionButton.addEventListener("click", () => {
        sectionState.setExpanded(!sectionState.expanded);
      });

      sectionState.setExpanded(sectionState.expanded);
      state.sections.push(sectionState);
    });
  }

  function createPaperNode(paper, sectionId, paperIndex) {
    const root = document.createElement("li");
    root.className = "paper-item";

    const header = document.createElement("div");
    header.className = "paper-header";

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "paper-toggle";

    const abstractId = `abs-${sectionId}-${paperIndex}`;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", abstractId);

    const titleRow = document.createElement("div");
    titleRow.className = "paper-title-row";

    const title = document.createElement("h3");
    title.className = "paper-title";
    title.textContent = paper.title;

    const tags = document.createElement("div");
    tags.className = "paper-tags";

    if (paper.core) {
      const coreTag = document.createElement("span");
      coreTag.className = "tag tag-core";
      coreTag.textContent = "Core";
      tags.appendChild(coreTag);
    }

    titleRow.appendChild(title);
    titleRow.appendChild(tags);

    const meta = document.createElement("p");
    meta.className = "paper-meta";
    meta.textContent = buildCitationLine(paper);

    const links = document.createElement("div");
    links.className = "paper-links";

    if (paper.localPdf) {
      links.appendChild(buildLink(paper.localPdf, "PDF"));
    }

    if (paper.doi) {
      links.appendChild(buildLink(doiToUrl(paper.doi), "Publisher"));
    }

    if (paper.url) {
      links.appendChild(buildLink(paper.url, "Publisher"));
    }

    toggle.appendChild(titleRow);
    toggle.appendChild(meta);
    if (links.childElementCount > 0) {
      toggle.appendChild(links);
    }

    const abstract = document.createElement("div");
    abstract.className = "paper-abstract";
    abstract.id = abstractId;

    if (paper.abstractStatus === "placeholder") {
      abstract.classList.add("is-placeholder");
    }

    const label = document.createElement("p");
    label.className = "paper-abstract-label";
    label.textContent = "Abstract";

    const abstractText = document.createElement("p");
    abstractText.textContent = paper.abstract || "Abstract not yet available. Add it in data.js.";

    abstract.appendChild(label);
    abstract.appendChild(abstractText);

    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", expanded ? "false" : "true");
      abstract.classList.toggle("is-open", !expanded);
    });

    header.appendChild(toggle);
    root.appendChild(header);
    root.appendChild(abstract);

    const searchable = [
      paper.title,
      Array.isArray(paper.authors) ? paper.authors.join(" ") : "",
      paper.year,
      paper.venue,
    ]
      .join(" ")
      .toLowerCase();

    return {
      root,
      toggle,
      abstract,
      searchable,
      core: Boolean(paper.core),
      close() {
        this.toggle.setAttribute("aria-expanded", "false");
        this.abstract.classList.remove("is-open");
      },
    };
  }

  function buildCitationLine(paper) {
    const authors = Array.isArray(paper.authors) ? paper.authors.join(", ") : "";
    const pieces = [];

    if (authors) pieces.push(authors);
    if (paper.year) pieces.push(String(paper.year));
    if (paper.venue) pieces.push(paper.venue);

    return pieces.join(" - ");
  }

  function doiToUrl(rawDoi) {
    const doi = String(rawDoi)
      .trim()
      .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");

    return `https://doi.org/${doi}`;
  }

  function buildLink(href, label) {
    const a = document.createElement("a");
    a.className = "paper-link";
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = label;
    return a;
  }

  function bindControls() {
    refs.searchInput.addEventListener("input", () => {
      state.query = refs.searchInput.value.trim().toLowerCase();
      applyFilters();
    });

    refs.coreOnlyInput.addEventListener("change", () => {
      state.coreOnly = refs.coreOnlyInput.checked;
      applyFilters();
    });

  }

  function applyFilters() {
    let totalPapers = 0;
    let visiblePapers = 0;

    state.sections.forEach((section) => {
      let sectionVisible = 0;

      section.papers.forEach((paper) => {
        totalPapers += 1;

        const matchesQuery = !state.query || paper.searchable.includes(state.query);
        const matchesCore = !state.coreOnly || paper.core;
        const matches = matchesQuery && matchesCore;

        paper.root.hidden = !matches;
        if (!matches) {
          paper.close();
        }

        if (matches) {
          sectionVisible += 1;
          visiblePapers += 1;
        }
      });

      section.root.hidden = sectionVisible === 0;

      if (state.query || state.coreOnly) {
        section.count.textContent = `${sectionVisible}/${section.totalCount}`;
      } else {
        section.count.textContent = `${section.totalCount} papers`;
      }

      if (sectionVisible === 0) {
        section.setExpanded(false);
      } else if (state.query || state.coreOnly) {
        section.setExpanded(true);
      }
    });

    refs.resultCount.textContent = `Showing ${visiblePapers} of ${totalPapers} papers`;
    refs.noResults.hidden = visiblePapers !== 0;
  }
})();

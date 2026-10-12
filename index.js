const STORAGE_KEY = "kakeiboEntries";
const yenFormatter = new Intl.NumberFormat("ja-JP");

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".entry-panel form");
  const entryList = document.querySelector("#entry-list");
  const summaryTotal = document.querySelector("#summary-total");
  let entries = loadEntries();

  renderEntries();

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const amount = Number(formData.get("amount"));
    const entry = {
      date: String(formData.get("date")),
      item: String(formData.get("item")).trim(),
      type: String(formData.get("type")),
      amount,
    };

    if (!entry.date || !entry.item || !["expense", "income"].includes(entry.type) || !Number.isFinite(amount) || amount < 0) {
      return;
    }

    const updatedEntries = [...entries, entry];

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
      entries = updatedEntries;
      renderEntries();
      form.reset();
    } catch {
      window.alert("データを保存できませんでした。ブラウザーの保存領域を確認してください。");
    }
  });

  function loadEntries() {
    try {
      const storedEntries = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");

      if (!Array.isArray(storedEntries)) {
        return [];
      }

      return storedEntries.filter((entry) =>
        entry !== null &&
        typeof entry.date === "string" &&
        typeof entry.item === "string" &&
        ["expense", "income"].includes(entry.type) &&
        Number.isFinite(entry.amount) &&
        entry.amount >= 0
      );
    } catch {
      return [];
    }
  }

  function renderEntries() {
    entryList.replaceChildren();

    if (entries.length === 0) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 4;
      cell.textContent = "登録されたデータはありません。";
      row.append(cell);
      entryList.append(row);
    } else {
      for (const entry of entries) {
        const row = document.createElement("tr");
        const values = [
          entry.date,
          entry.item,
          entry.type === "income" ? "収入" : "支出",
          `${yenFormatter.format(entry.amount)}円`,
        ];

        for (const value of values) {
          const cell = document.createElement("td");
          cell.textContent = value;
          row.append(cell);
        }

        entryList.append(row);
      }
    }

    const balance = entries.reduce((total, entry) =>
      total + (entry.type === "income" ? entry.amount : -entry.amount), 0
    );
    summaryTotal.textContent = `${yenFormatter.format(balance)}円`;
  }
});
import { Field } from "../../components/ui/Field";
import { toTitle } from "../../lib/format";
import { createId } from "../../lib/storage";

export function SimpleListEditor({ title, collection, fields, data, setData }) {
  function addItem() {
    const nextItem = fields.reduce((acc, field) => ({ ...acc, [field]: field === "href" ? "" : `New ${field}` }), { id: createId(collection) });
    setData((current) => ({ ...current, [collection]: [...current[collection], nextItem] }));
  }

  function updateItem(id, field, value) {
    setData((current) => ({
      ...current,
      [collection]: current[collection].map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  }

  function removeItem(id) {
    setData((current) => ({ ...current, [collection]: current[collection].filter((item) => item.id !== id) }));
  }

  return (
    <div className="editor-stack">
      <div className="editor-heading-row">
        <h2>{title}</h2>
        <button className="ghost-button" onClick={addItem}>Add item</button>
      </div>
      <div className="admin-list">
        {data[collection].map((item) => (
          <div className="admin-item" key={item.id}>
            {fields.map((field) => (
              <Field
                key={field}
                label={toTitle(field)}
                value={item[field] || ""}
                multiline={field === "description" || field === "text"}
                onChange={(value) => updateItem(item.id, field, value)}
              />
            ))}
            <button className="danger-button" onClick={() => removeItem(item.id)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}

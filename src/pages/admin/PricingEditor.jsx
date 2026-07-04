import { Field } from "../../components/ui/Field";
import { createId } from "../../lib/storage";

export function PricingEditor({ data, setData }) {
  function updatePrice(id, field, value) {
    setData((current) => ({
      ...current,
      pricing: current.pricing.map((price) => (price.id === id ? { ...price, [field]: value } : price)),
    }));
  }

  function addPrice() {
    setData((current) => ({
      ...current,
      pricing: [...current.pricing, { id: createId("price"), name: "New package", amount: "$0", note: "Add details." }],
    }));
  }

  function removePrice(id) {
    setData((current) => ({ ...current, pricing: current.pricing.filter((price) => price.id !== id) }));
  }

  return (
    <div className="editor-stack">
      <div className="editor-heading-row">
        <h2>Pricing</h2>
        <button className="ghost-button" onClick={addPrice}>Add price</button>
      </div>
      <div className="admin-list">
        {data.pricing.map((price) => (
          <div className="admin-item" key={price.id}>
            <Field label="Name" value={price.name} onChange={(value) => updatePrice(price.id, "name", value)} />
            <Field label="Amount" value={price.amount} onChange={(value) => updatePrice(price.id, "amount", value)} />
            <Field label="Note" value={price.note} onChange={(value) => updatePrice(price.id, "note", value)} />
            <button className="danger-button" onClick={() => removePrice(price.id)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}

import FormModal from "./components/FormModal"
import TabelModal from "./components/TabelModal"

export default function ModalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Modal Awal</h1>
        <p className="text-sm text-gray-400 mt-1">Catat investasi awal sebelum mulai berjualan</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <FormModal />
        </div>
        <div className="lg:col-span-2">
          <TabelModal />
        </div>
      </div>
    </div>
  )
}
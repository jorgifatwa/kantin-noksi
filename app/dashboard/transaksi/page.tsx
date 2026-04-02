import FormTransaksi from "./components/FormTransaksi"
import TabelTransaksi from "./components/TabelTransaksi"

export default function TransaksiPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Transaksi</h1>
        <p className="text-sm text-gray-400 mt-1">Catat uang masuk dan keluar harian</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <FormTransaksi />
        </div>
        <div className="lg:col-span-2">
          <TabelTransaksi />
        </div>
      </div>
    </div>
  )
}
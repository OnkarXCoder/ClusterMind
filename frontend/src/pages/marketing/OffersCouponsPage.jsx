import { useCallback, useEffect, useState } from 'react'
import { Plus, Tag } from 'lucide-react'
import Button from '../../components/marketing/Button'
import ChartCard from '../../components/marketing/ChartCard'
import DataTable from '../../components/marketing/DataTable'
import StatusBadge from '../../components/marketing/StatusBadge'
import Modal from '../../components/marketing/Modal'
import LoadingState from '../../components/marketing/LoadingState'
import EmptyState from '../../components/marketing/EmptyState'
import { useToast } from '../../components/marketing/Toast'
import { getMarketingCoupons, createMarketingCoupon, getMarketingOffers, createMarketingOffer } from '../../api'

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const normalizeCoupon = (c) => ({
  id: c._id || c.id,
  name: c.code,
  type: 'Coupon',
  discount: typeof c.discount === 'number' ? `${c.discount}%` : c.discount,
  segment: c.segment || 'All Customers',
  validFrom: formatDate(c.validFrom),
  validUntil: formatDate(c.validTill),
  status: c.used ? 'Completed' : c.status || 'Active',
})

const normalizeOffer = (offer) => ({
  id: offer._id || offer.id,
  name: offer.name || offer.code,
  type: offer.offerType || 'Offer',
  discount: offer.offerType === 'Free Shipping' ? 'Free Shipping' : `${offer.discount || 0}${offer.offerType === 'Flat Discount' ? ' INR' : '%'}`,
  segment: offer.segment || 'All Customers',
  categories: Array.isArray(offer.categories) ? offer.categories.join(', ') : offer.categories || 'All Categories',
  minimumPurchase: Number(offer.minimumPurchase || 0).toLocaleString('en-IN'),
  maxDiscount: Number(offer.maxDiscount || 0).toLocaleString('en-IN'),
  validFrom: formatDate(offer.validFrom),
  validUntil: formatDate(offer.validTill),
  status: offer.status || 'Active',
})

const COLUMNS = [
  { key: 'name', label: 'Name', render: (v) => <span className="font-semibold text-slate-900">{v}</span> },
  { key: 'type', label: 'Type', render: (v) => <StatusBadge status={v} /> },
  { key: 'discount', label: 'Discount' },
  { key: 'segment', label: 'Target Segment' },
  { key: 'validFrom', label: 'Valid From' },
  { key: 'validUntil', label: 'Valid Until' },
  { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
]

const OFFER_COLUMNS = [
  { key: 'name', label: 'Offer', render: (v) => <span className="font-semibold text-slate-900">{v}</span> },
  { key: 'type', label: 'Type', render: (v) => <StatusBadge status={v} /> },
  { key: 'discount', label: 'Discount' },
  { key: 'minimumPurchase', label: 'Min Purchase' },
  { key: 'maxDiscount', label: 'Max Limit' },
  { key: 'categories', label: 'Categories' },
  { key: 'segment', label: 'Segment' },
  { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
]

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100'

const EMPTY = {
  name: '',
  description: '',
  offerType: 'Percentage Discount',
  discount: '',
  minimumPurchase: '',
  maxDiscount: '',
  categories: '',
  segment: 'All Customers',
  validFrom: '',
  validUntil: '',
}

export default function OffersCouponsPage() {
  const { show } = useToast()
  const [coupons, setCoupons] = useState([])
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)

  const loadCoupons = useCallback(async () => {
    try {
      const res = await getMarketingCoupons()
      setCoupons((res?.items ?? []).map(normalizeCoupon))
    } catch {
      setCoupons([])
      show('Unable to load coupons.', 'error')
    }
  }, [show])

  const loadOffers = useCallback(async () => {
    try {
      const res = await getMarketingOffers()
      setOffers((res?.items ?? []).map(normalizeOffer))
    } catch {
      setOffers([])
      show('Unable to load offers.', 'error')
    }
  }, [show])

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([loadCoupons(), loadOffers()]).finally(() => {
      if (active) setLoading(false)
    })
    return () => {
      active = false
    }
  }, [loadCoupons, loadOffers])

  const openCreate = (kind) => {
    setForm(EMPTY)
    setModal(kind)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (modal === 'offer') {
      try {
        await createMarketingOffer({
          name: form.name,
          description: form.description,
          offerType: form.offerType,
          discount: Number(String(form.discount).replace(/[^0-9.]/g, '')) || 0,
          minimumPurchase: Number(form.minimumPurchase || 0),
          maxDiscount: Number(form.maxDiscount || 0),
          categories: form.categories,
          segment: form.segment,
          validFrom: form.validFrom || undefined,
          validTill: form.validUntil || undefined,
          status: 'Active',
        })
        await loadOffers()
        show(`Offer "${form.name}" created.`, 'success')
      } catch {
        show('Unable to create offer.', 'error')
      }
      setModal(null)
      return
    }
    const discountNumber = Number(String(form.discount).replace(/[^0-9.]/g, '')) || 0
    try {
      await createMarketingCoupon({
        code: form.name,
        discount: discountNumber,
        segment: form.segment,
        validFrom: form.validFrom || undefined,
        validTill: form.validUntil || undefined,
        status: 'Active',
      })
      await loadCoupons()
      show(`Coupon "${form.name}" created.`, 'success')
    } catch {
      show('Unable to create coupon.', 'error')
    }
    setModal(null)
  }

  if (loading) {
    return (
      <div className="dm-page">
        <LoadingState label="Loading coupons..." />
      </div>
    )
  }

  return (
    <div className="dm-page">
      <div className="dm-hero">
        <div className="dm-hero-icon orange">
          <Tag className="h-6 w-6" />
        </div>
        <h2 className="dm-hero-title">Offers & Coupons</h2>
        <p className="dm-hero-sub">Discounts and promotion codes by segment</p>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button variant="secondary" icon={Plus} onClick={() => openCreate('offer')}>
          Create Offer
        </Button>
        <Button icon={Plus} onClick={() => openCreate('coupon')}>
          Create Coupon
        </Button>
      </div>

      <ChartCard title="Offers" subtitle={`${offers.length} live offers and discount rules`}>
        {offers.length ? (
          <DataTable columns={OFFER_COLUMNS} rows={offers} />
        ) : (
          <EmptyState title="No offers available" description="Create an offer to target categories and customer segments." />
        )}
      </ChartCard>

      <ChartCard title="Coupons" subtitle={`${coupons.length} active coupons`}>
        <DataTable columns={COLUMNS} rows={coupons} />
      </ChartCard>

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal === 'offer' ? 'Create Offer' : 'Create Coupon'}
        subtitle="New promotion for the selected segment"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button type="submit" form="offer-form">
              {modal === 'offer' ? 'Create Offer' : 'Create Coupon'}
            </Button>
          </>
        }
      >
        <form id="offer-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              {modal === 'offer' ? 'Offer Name' : 'Coupon Code'}
            </label>
            <input
              className={inputClass}
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={modal === 'offer' ? 'e.g. 20% OFF Accessories' : 'e.g. SAVE500'}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {modal === 'offer' && (
              <>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Offer Description</label>
                  <textarea className={`${inputClass} resize-none`} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe who this offer is for and how it should be used" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Offer Type</label>
                  <select className={inputClass} value={form.offerType} onChange={(e) => setForm({ ...form, offerType: e.target.value })}>
                    {['Percentage Discount', 'Flat Discount', 'Buy One Get One (BOGO)', 'Free Shipping'].map((type) => <option key={type}>{type}</option>)}
                  </select>
                </div>
              </>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Discount Value</label>
              <input className={inputClass} required value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} placeholder="e.g. 20%" />
            </div>
            {modal === 'offer' && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Minimum Purchase Amount</label>
                  <input type="number" className={inputClass} value={form.minimumPurchase} onChange={(e) => setForm({ ...form, minimumPurchase: e.target.value })} placeholder="e.g. 999" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Maximum Discount Limit</label>
                  <input type="number" className={inputClass} value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} placeholder="e.g. 1500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Applicable Product Categories</label>
                  <input className={inputClass} value={form.categories} onChange={(e) => setForm({ ...form, categories: e.target.value })} placeholder="Electronics, Beauty, Fashion" />
                </div>
              </>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Target Segment</label>
              <select className={inputClass} value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })}>
                {['All Customers', 'Premium Customers', 'Loyal Customers', 'New Customers', 'Price Sensitive'].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Valid From</label>
              <input type="date" className={inputClass} required value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Valid Until</label>
              <input type="date" className={inputClass} required value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}

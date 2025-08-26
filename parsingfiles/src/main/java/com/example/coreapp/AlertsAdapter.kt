package com.example.coreapp

import android.text.format.DateFormat
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.example.coreapp.databinding.ItemAlertBinding

class AlertsAdapter(
    private val onClick: (Alert) -> Unit
) : RecyclerView.Adapter<AlertsAdapter.VH>() {

    private val items = mutableListOf<Alert>()

    fun updateAlerts(newItems: List<Alert>) {
        items.clear()
        items.addAll(newItems)
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val binding = ItemAlertBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return VH(binding, onClick)
    }

    override fun onBindViewHolder(holder: VH, position: Int) =
        holder.bind(items[position])

    override fun getItemCount(): Int = items.size

    class VH(
        private val binding: ItemAlertBinding,
        private val onClick: (Alert) -> Unit
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(item: Alert) {
            binding.title.text = item.title
            binding.message.text = item.message

            val dateStr = DateFormat.format("MMM d, yyyy h:mm a", item.timeMillis).toString()
            binding.time.text = dateStr

            binding.root.setOnClickListener { onClick(item) }
        }
    }
}

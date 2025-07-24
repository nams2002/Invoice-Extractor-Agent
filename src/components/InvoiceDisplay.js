import React from 'react';
import { motion } from 'framer-motion';
import { FaReceipt, FaDollarSign, FaCalendarAlt, FaUser, FaHashtag, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';

const InvoiceDisplay = ({ data, conversationId, compact = false, onClose }) => {
  if (!data) return null;

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'text-green-400 bg-green-400/10';
      case 'unpaid':
        return 'text-red-400 bg-red-400/10';
      case 'overdue':
        return 'text-orange-400 bg-orange-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const handlePayBill = () => {
    // For demo purposes, show an alert with payment information
    alert(`Payment initiated for ${formatCurrency(data.amount_due)}\n\nInvoice: ${data.invoice_number}\nAccount: ${data.account_number}\n\nIn a real implementation, this would redirect to a secure payment gateway.`);

    // In a real implementation, you would redirect to a payment gateway:
    // const paymentData = {
    //   amount: data.amount_due,
    //   invoiceNumber: data.invoice_number,
    //   accountNumber: data.account_number,
    //   billerName: data.biller_name
    // };
    // window.open(`/payment?invoice=${data.invoice_number}&amount=${data.amount_due}`, '_blank');
  };

  const handleDownload = () => {
    // Generate and download invoice PDF
    const invoiceText = `
INVOICE DETAILS
===============

Biller: ${data.biller_name || 'N/A'}
Account Number: ${data.account_number || 'N/A'}
Invoice Number: ${data.invoice_number || 'N/A'}
Amount Due: ${formatCurrency(data.amount_due)}
Due Date: ${formatDate(data.due_date)}
Service Address: ${data.service_address || 'N/A'}
Service Description: ${data.service_description || 'N/A'}
Status: ${data.status || 'N/A'}

Generated on: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_${data.invoice_number || 'details'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const fields = [
    {
      icon: FaUser,
      label: 'Biller',
      value: data.biller_name,
      color: 'text-blue-400'
    },
    {
      icon: FaHashtag,
      label: 'Account #',
      value: data.account_number,
      color: 'text-purple-400'
    },
    {
      icon: FaDollarSign,
      label: 'Amount Due',
      value: formatCurrency(data.amount_due),
      color: 'text-green-400'
    },
    {
      icon: FaCalendarAlt,
      label: 'Due Date',
      value: formatDate(data.due_date),
      color: 'text-orange-400'
    },
    {
      icon: FaReceipt,
      label: 'Invoice #',
      value: data.invoice_number,
      color: 'text-cyan-400'
    },
    {
      icon: FaMapMarkerAlt,
      label: 'Service Address',
      value: data.service_address,
      color: 'text-pink-400'
    }
  ];

  // Compact version for floating display
  if (compact) {
    return (
      <motion.div
        className="bg-dark-800/90 backdrop-blur-md rounded-lg p-4 border border-primary-500/30 shadow-lg max-w-sm"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center">
            <FaReceipt className="mr-2 text-blue-400" />
            Invoice Uploaded
          </h3>
          <div className="flex items-center space-x-2">
            {data.status && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(data.status)}`}>
                {data.status.toUpperCase()}
              </span>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700/50"
                title="Dismiss notification"
              >
                <FaTimes className="text-xs" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Amount:</span>
            <span className="text-green-400 font-medium">{formatCurrency(data.amount_due)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Due:</span>
            <span className="text-orange-400">{formatDate(data.due_date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Biller:</span>
            <span className="text-white truncate ml-2">{data.biller_name || 'N/A'}</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="card-glass max-h-[calc(100vh-300px)] overflow-y-auto"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <FaReceipt className="mr-2 text-blue-400" />
          Invoice Details
        </h2>
        
        {data.status && (
          <motion.span
            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(data.status)}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            {data.status.toUpperCase()}
          </motion.span>
        )}
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <motion.div
            key={field.label}
            className="flex items-center space-x-3 p-3 rounded-lg bg-dark-800/50 hover:bg-dark-700/50 transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={`p-2 rounded-lg bg-dark-700 ${field.color}`}>
              <field.icon className="text-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                {field.label}
              </p>
              <p className="text-white font-medium truncate">
                {field.value || 'N/A'}
              </p>
            </div>
          </motion.div>
        ))}

        {/* Billing Period */}
        {data.billing_period && (
          <motion.div
            className="flex items-center space-x-3 p-3 rounded-lg bg-dark-800/50"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="p-2 rounded-lg bg-dark-700 text-indigo-400">
              <FaCalendarAlt className="text-sm" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                Billing Period
              </p>
              <p className="text-white font-medium">
                {data.billing_period}
              </p>
            </div>
          </motion.div>
        )}

        {/* Service Description */}
        {data.service_description && (
          <motion.div
            className="p-3 rounded-lg bg-dark-800/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
              Service Description
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">
              {data.service_description}
            </p>
          </motion.div>
        )}
      </div>

      {/* Quick Actions */}
      <motion.div
        className="mt-6 pt-4 border-t border-dark-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
          Quick Actions
        </p>
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            onClick={handlePayBill}
            className="btn-primary text-sm py-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title="Pay this bill"
          >
            Pay Bill
          </motion.button>
          <motion.button
            onClick={handleDownload}
            className="btn-secondary text-sm py-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title="Download invoice details"
          >
            Download
          </motion.button>
        </div>
      </motion.div>

      {/* Processing Info */}
      {data.processed_at && (
        <motion.div
          className="mt-4 pt-3 border-t border-dark-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-xs text-gray-500 text-center">
            Processed: {new Date(data.processed_at).toLocaleString()}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default InvoiceDisplay;

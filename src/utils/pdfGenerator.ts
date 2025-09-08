// PDF Generation utility for accounting reports
export interface ReportData {
  title: string
  companyName: string
  period: string
  data: any
  generatedAt: string
}

export const generatePDF = (reportData: ReportData): void => {
  // Create a new window for PDF generation
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const htmlContent = generateHTMLContent(reportData)
  
  printWindow.document.write(htmlContent)
  printWindow.document.close()
  
  // Wait for content to load then print
  printWindow.onload = () => {
    printWindow.print()
  }
}

const generateHTMLContent = (reportData: ReportData): string => {
  const { title, companyName, period, data, generatedAt } = reportData
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 20px;
          background: white;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #040458;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #040458;
          margin-bottom: 10px;
        }
        .report-title {
          font-size: 20px;
          color: #666;
          margin-bottom: 5px;
        }
        .period {
          font-size: 14px;
          color: #888;
        }
        .content {
          margin-bottom: 30px;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #040458;
          margin-bottom: 10px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        .metric-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .metric-label {
          font-weight: 500;
        }
        .metric-value {
          font-weight: bold;
          color: #040458;
        }
        .total-row {
          background-color: #f8f9fa;
          font-weight: bold;
          font-size: 16px;
          padding: 12px 0;
          border-top: 2px solid #040458;
          border-bottom: 2px solid #040458;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 12px;
          color: #888;
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">${companyName}</div>
        <div class="report-title">${title}</div>
        <div class="period">${period}</div>
      </div>
      
      <div class="content">
        ${generateReportContent(data)}
      </div>
      
      <div class="footer">
        Generated on ${new Date(generatedAt).toLocaleString()}
      </div>
    </body>
    </html>
  `
}

const generateReportContent = (data: any): string => {
  if (data.type === 'profit-loss') {
    return `
      <div class="section">
        <div class="section-title">REVENUE</div>
        <div class="metric-row">
          <span class="metric-label">Total Sales</span>
          <span class="metric-value">UGX ${data.totalRevenue?.toLocaleString() || '0'}</span>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">EXPENSES</div>
        <div class="metric-row">
          <span class="metric-label">Total Expenses</span>
          <span class="metric-value">UGX ${data.totalExpenses?.toLocaleString() || '0'}</span>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">TAXES</div>
        <div class="metric-row">
          <span class="metric-label">VAT Collected (18%)</span>
          <span class="metric-value">UGX ${data.vatCollected?.toLocaleString() || '0'}</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Income Tax (30%)</span>
          <span class="metric-value">UGX ${data.incomeTax?.toLocaleString() || '0'}</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Withholding Tax (6%)</span>
          <span class="metric-value">UGX ${data.withholdingTax?.toLocaleString() || '0'}</span>
        </div>
      </div>
      
      <div class="section">
        <div class="metric-row total-row">
          <span class="metric-label">NET INCOME</span>
          <span class="metric-value">UGX ${data.netIncome?.toLocaleString() || '0'}</span>
        </div>
      </div>
    `
  }
  
  if (data.type === 'balance-sheet') {
    return `
      <div class="section">
        <div class="section-title">ASSETS</div>
        <div class="metric-row">
          <span class="metric-label">Cash</span>
          <span class="metric-value">UGX ${data.cashBalance?.toLocaleString() || '0'}</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Accounts Receivable</span>
          <span class="metric-value">UGX ${data.accountsReceivable?.toLocaleString() || '0'}</span>
        </div>
        <div class="metric-row total-row">
          <span class="metric-label">Total Assets</span>
          <span class="metric-value">UGX ${data.totalAssets?.toLocaleString() || '0'}</span>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">LIABILITIES</div>
        <div class="metric-row">
          <span class="metric-label">Accounts Payable</span>
          <span class="metric-value">UGX ${data.accountsPayable?.toLocaleString() || '0'}</span>
        </div>
        <div class="metric-row total-row">
          <span class="metric-label">Total Liabilities</span>
          <span class="metric-value">UGX ${data.totalLiabilities?.toLocaleString() || '0'}</span>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">EQUITY</div>
        <div class="metric-row total-row">
          <span class="metric-label">Owner's Equity</span>
          <span class="metric-value">UGX ${data.equity?.toLocaleString() || '0'}</span>
        </div>
      </div>
    `
  }
  
  if (data.type === 'vat-report') {
    return `
      <div class="section">
        <div class="section-title">VAT SUMMARY</div>
        <div class="metric-row">
          <span class="metric-label">VAT Collected (18%)</span>
          <span class="metric-value">UGX ${data.vatCollected?.toLocaleString() || '0'}</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">VAT Paid on Expenses</span>
          <span class="metric-value">UGX ${data.vatPaid?.toLocaleString() || '0'}</span>
        </div>
        <div class="metric-row total-row">
          <span class="metric-label">Net VAT Payable</span>
          <span class="metric-value">UGX ${data.netVat?.toLocaleString() || '0'}</span>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">EFRIS COMPLIANCE</div>
        <div class="metric-row">
          <span class="metric-label">Total Sales Subject to VAT</span>
          <span class="metric-value">UGX ${data.totalRevenue?.toLocaleString() || '0'}</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">VAT Rate</span>
          <span class="metric-value">18%</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">EFRIS Status</span>
          <span class="metric-value">Active</span>
        </div>
      </div>
    `
  }
  
  return '<div class="section"><div class="section-title">Report Data</div><p>No data available</p></div>'
}

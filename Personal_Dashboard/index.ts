import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Wallet, PieChart, BarChart3, ChevronRight, Settings, User, Trash2, Plus, Download, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface TransactionProps {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
}

interface CategoryProps {
  id: string;
  name: string;
  percentage: number;
  color: string;
}

const Index = () => {
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState("September");
  const [transactions, setTransactions] = useState<TransactionProps[]>([
    { id: "1", title: "Salary", amount: 5000, date: "Sep 01", category: "Income" },
    { id: "2", title: "Rent", amount: -1500, date: "Sep 05", category: "Housing" },
    { id: "3", title: "Grocery", amount: -200, date: "Sep 10", category: "Food" },
    { id: "4", title: "Freelance", amount: 800, date: "Sep 15", category: "Income" },
    { id: "5", title: "Stocks", amount: 350, date: "Sep 20", category: "Investment" },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Omit<TransactionProps, 'id'>>({
    title: '',
    amount: 0,
    date: '',
    category: '',
  });

  // Sample data for expense categories
  const [categories, setCategories] = useState<CategoryProps[]>([
    { id: "1", name: "Housing", percentage: 43, color: "#F44336" },
    { id: "2", name: "Food", percentage: 28, color: "#2196F3" },
    { id: "3", name: "Entertainment", percentage: 18, color: "#8BC34A" },
    { id: "4", name: "Transportation", percentage: 11, color: "#FFC107" },
  ]);

  // Calculate summary data
  const income = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = Math.abs(
    transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)
  );
  
  const investments = transactions
    .filter(t => t.category === "Investment" && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  // Navigation items for sidebar
  const navItems = [
    { icon: BarChart3, label: "Dashboard", active: true },
    { icon: Wallet, label: "Transactions", active: false },
    { icon: PieChart, label: "Reports", active: false },
    { icon: Settings, label: "Settings", active: false },
  ];

  // Format amount with ₹ symbol
  const formatAmount = (amount: number) => {
    return `₹${Math.abs(amount).toLocaleString()}`;
  };

  // Delete transaction
  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
    
    // Update category percentages after deletion
    updateCategoryPercentages(transactions.filter(t => t.id !== id));
    
    toast({
      title: "Transaction deleted",
      description: "The transaction has been removed successfully.",
    });
  };

  // Add new transaction
  const handleAddTransaction = () => {
    if (!newTransaction.title || !newTransaction.amount || !newTransaction.date || !newTransaction.category) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    const newId = (transactions.length + 1).toString();
    const transactionToAdd = {
      id: newId,
      ...newTransaction,
    };

    const updatedTransactions = [...transactions, transactionToAdd];
    setTransactions(updatedTransactions);
    
    // Update category percentages
    updateCategoryPercentages(updatedTransactions);

    // Reset form
    setNewTransaction({
      title: '',
      amount: 0,
      date: '',
      category: '',
    });
    setShowAddForm(false);

    toast({
      title: "Transaction added",
      description: "New transaction has been added successfully.",
    });
  };

  // Update category percentages based on transactions
  const updateCategoryPercentages = (updatedTransactions: TransactionProps[]) => {
    // Only consider expenses (negative amounts)
    const expenseTransactions = updatedTransactions.filter(t => t.amount < 0);
    
    // If no expenses, don't update
    if (expenseTransactions.length === 0) return;
    
    // Get total expenses
    const totalExpense = Math.abs(expenseTransactions.reduce((sum, t) => sum + t.amount, 0));
    
    // Group by category and calculate percentages
    const categoryAmounts: Record<string, number> = {};
    
    // Initialize with 0 for existing categories
    categories.forEach(cat => {
      categoryAmounts[cat.name] = 0;
    });
    
    // Sum amounts by category
    expenseTransactions.forEach(t => {
      if (categoryAmounts[t.category] !== undefined) {
        categoryAmounts[t.category] += Math.abs(t.amount);
      } else {
        categoryAmounts[t.category] = Math.abs(t.amount);
      }
    });
    
    // Convert to percentages and update state
    const updatedCategories = Object.keys(categoryAmounts)
      .filter(name => categoryAmounts[name] > 0)
      .map((name, index) => {
        // Find existing category or create new
        const existingCategory = categories.find(c => c.name === name);
        const percentage = Math.round((categoryAmounts[name] / totalExpense) * 100);
        
        return {
          id: existingCategory?.id || (categories.length + index + 1).toString(),
          name,
          percentage,
          color: existingCategory?.color || getRandomColor(),
        };
      });
    
    // Sort by percentage (highest first)
    updatedCategories.sort((a, b) => b.percentage - a.percentage);
    setCategories(updatedCategories);
  };

  // Get random color for new categories
  const getRandomColor = () => {
    const colors = ["#F44336", "#2196F3", "#8BC34A", "#FFC107", "#9C27B0", "#FF9800"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Toggle add form visibility
  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
  };

  // Export data to JSON file
  const exportData = () => {
    try {
      // Create data object with transactions and categories
      const dataToExport = {
        transactions,
        categories,
        currentMonth
      };
      
      // Convert to JSON string
      const jsonString = JSON.stringify(dataToExport, null, 2);
      
      // Create blob and download link
      const blob = new Blob([jsonString], { type: 'application/json' });
      const href = URL.createObjectURL(blob);
      
      // Create and trigger download
      const link = document.createElement('a');
      link.href = href;
      link.download = `cashlytics_${currentMonth.toLowerCase()}_export.json`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
      
      toast({
        title: "Export successful",
        description: "Your financial data has been exported to JSON.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your data.",
        variant: "destructive",
      });
      console.error("Export error:", error);
    }
  };

  // Import data from JSON file
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const fileInput = event.target;
      if (fileInput.files && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            if (e.target && typeof e.target.result === 'string') {
              const importedData = JSON.parse(e.target.result);
              
              // Validate imported data
              if (!importedData.transactions || !importedData.categories) {
                throw new Error("Invalid file format");
              }
              
              // Update state with imported data
              setTransactions(importedData.transactions);
              setCategories(importedData.categories);
              if (importedData.currentMonth) {
                setCurrentMonth(importedData.currentMonth);
              }
              
              toast({
                title: "Import successful",
                description: "Your financial data has been imported.",
              });
            }
          } catch (parseError) {
            toast({
              title: "Import failed",
              description: "Invalid file format. Please select a valid JSON file.",
              variant: "destructive",
            });
            console.error("Parse error:", parseError);
          }
        };
        
        reader.onerror = () => {
          toast({
            title: "Import failed",
            description: "There was an error reading the file.",
            variant: "destructive",
          });
        };
        
        reader.readAsText(file);
      }
      
      // Reset the file input
      fileInput.value = '';
    } catch (error) {
      toast({
        title: "Import failed",
        description: "There was an error importing your data.",
        variant: "destructive",
      });
      console.error("Import error:", error);
    }
  };

  // Hidden file input for import
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:block w-64 bg-cashlytics-green text-white">
        <div className="p-6">
          <h2 className="text-2xl font-bold">Cashlytics</h2>
        </div>
        <nav className="mt-6">
          {navItems.map((item, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center px-6 py-3 cursor-pointer hover:bg-opacity-90 transition-colors",
                item.active ? "bg-white bg-opacity-20" : ""
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div className="absolute bottom-8 left-8 flex items-center gap-3">
          <div className="bg-white bg-opacity-20 p-2 rounded-full">
            <User className="w-5 h-5" />
          </div>
          <span className="font-medium">John Doe</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={exportData}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={triggerFileInput}
            >
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              ref={fileInputRef}
              onChange={importData}
            />
            <div className="bg-white rounded-lg shadow px-4 py-2 font-medium">
              {currentMonth}
            </div>
          </div>
        </header>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-sm animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{formatAmount(income)}</span>
                <div className="bg-green-100 p-2 rounded-full">
                  <ArrowUp className="w-4 h-4 text-cashlytics-green" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{formatAmount(expenses)}</span>
                <div className="bg-red-100 p-2 rounded-full">
                  <ArrowDown className="w-4 h-4 text-cashlytics-red" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Investments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{formatAmount(investments)}</span>
                <div className="bg-blue-100 p-2 rounded-full">
                  <PieChart className="w-4 h-4 text-cashlytics-blue" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent transactions */}
          <Card className="shadow-sm lg:col-span-2 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-cashlytics-green flex items-center"
                  onClick={toggleAddForm}
                >
                  {showAddForm ? 'Cancel' : <><Plus className="h-4 w-4 mr-1" /> Add</>}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-cashlytics-green flex items-center"
                >
                  View all <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Add Transaction Form */}
              {showAddForm && (
                <div className="bg-gray-50 p-4 rounded-md mb-4 animate-fade-in">
                  <h3 className="font-medium mb-3">Add New Transaction</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Title</label>
                      <Input 
                        value={newTransaction.title}
                        onChange={(e) => setNewTransaction({...newTransaction, title: e.target.value})}
                        placeholder="e.g., Grocery shopping"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Amount (₹)</label>
                      <Input 
                        type="number"
                        value={newTransaction.amount !== 0 ? Math.abs(newTransaction.amount) : ''}
                        onChange={(e) => setNewTransaction({
                          ...newTransaction, 
                          amount: e.target.value ? parseFloat(e.target.value) * (newTransaction.category === "Income" || newTransaction.category === "Investment" ? 1 : -1) : 0
                        })}
                        placeholder="e.g., 1000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Date</label>
                      <Input 
                        type="text"
                        value={newTransaction.date}
                        onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                        placeholder="e.g., Sep 25"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Category</label>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={newTransaction.category}
                        onChange={(e) => {
                          const category = e.target.value;
                          setNewTransaction({
                            ...newTransaction, 
                            category,
                            // Adjust amount sign based on category
                            amount: newTransaction.amount !== 0 ? 
                              Math.abs(newTransaction.amount) * (category === "Income" || category === "Investment" ? 1 : -1) : 
                              0
                          });
                        }}
                      >
                        <option value="">Select category</option>
                        <option value="Income">Income</option>
                        <option value="Housing">Housing</option>
                        <option value="Food">Food</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Investment">Investment</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleAddTransaction}>
                      Add Transaction
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <p className="text-center py-6 text-gray-500">No transactions to display</p>
                ) : (
                  transactions.map((transaction) => (
                    <div 
                      key={transaction.id}
                      className="flex items-center justify-between py-2 animate-slide-in"
                      style={{ animationDelay: `${0.1 * parseInt(transaction.id)}s` }}
                    >
                      <div className="flex items-center">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center mr-3",
                          transaction.amount > 0 
                            ? "bg-green-100" 
                            : transaction.category === "Investment" 
                              ? "bg-blue-100" 
                              : "bg-red-100"
                        )}>
                          {transaction.amount > 0 ? (
                            <ArrowUp className="w-5 h-5 text-cashlytics-green" />
                          ) : (
                            <ArrowDown className="w-5 h-5 text-cashlytics-red" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.title}</p>
                          <p className="text-sm text-gray-500">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={cn(
                          "font-semibold mr-3",
                          transaction.amount > 0 ? "text-cashlytics-green" : "text-cashlytics-red"
                        )}>
                          {transaction.amount > 0 ? "+" : ""}{formatAmount(transaction.amount)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-cashlytics-red"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Expense breakdown */}
          <Card className="shadow-sm animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <p className="text-center py-6 text-gray-500">No expense data to display</p>
              ) : (
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div key={category.id} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className="text-sm text-gray-500">{category.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${category.percentage}%`,
                            backgroundColor: category.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;

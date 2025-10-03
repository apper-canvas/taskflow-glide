import { useState } from "react"
import Input from "@/components/atoms/Input"
import ApperIcon from "@/components/ApperIcon"

const SearchBar = ({ onSearch, placeholder = "Search tasks..." }) => {
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = (value) => {
    setSearchTerm(value)
    onSearch(value)
  }

  return (
    <div className="relative">
      <ApperIcon 
        name="Search" 
        size={20} 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
      />
      <Input
        type="text"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-4"
      />
    </div>
  )
}

export default SearchBar
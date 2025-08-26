import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Alert } from '../types/Alert';

interface AlertFiltersProps {
  alerts: Alert[];
  onFilteredAlertsChange: (filteredAlerts: Alert[]) => void;
}

interface FilterOptions {
  searchQuery: string;
  alertTypes: string[];
  timeRange: 'all' | 'today' | 'week' | 'month';
  sortBy: 'newest' | 'oldest' | 'alphabetical';
}

export default function AlertFilters({ alerts, onFilteredAlertsChange }: AlertFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    alertTypes: [],
    timeRange: 'all',
    sortBy: 'newest',
  });

  // Extract unique alert types from current alerts
  const availableAlertTypes = useMemo(() => {
    const types = new Set<string>();
    alerts.forEach(alert => {
      const titleParts = alert.title.split(' | ');
      if (titleParts.length >= 4) {
        const alertType = titleParts[3].trim();
        if (alertType) types.add(alertType);
      }
    });
    return Array.from(types).sort();
  }, [alerts]);

  const filterAlerts = useCallback((newFilters: FilterOptions) => {
    let filtered = [...alerts];

    // Search query filter
    if (newFilters.searchQuery.trim()) {
      const query = newFilters.searchQuery.toLowerCase();
      filtered = filtered.filter(alert =>
        alert.title.toLowerCase().includes(query) ||
        alert.message.toLowerCase().includes(query) ||
        alert.id.toLowerCase().includes(query)
      );
    }

    // Alert type filter
    if (newFilters.alertTypes.length > 0) {
      filtered = filtered.filter(alert => {
        const titleParts = alert.title.split(' | ');
        const alertType = titleParts.length >= 4 ? titleParts[3].trim() : '';
        return newFilters.alertTypes.includes(alertType);
      });
    }

    // Time range filter
    const now = Date.now();
    if (newFilters.timeRange !== 'all') {
      const timeRanges = {
        today: 24 * 60 * 60 * 1000, // 1 day
        week: 7 * 24 * 60 * 60 * 1000, // 7 days
        month: 30 * 24 * 60 * 60 * 1000, // 30 days
      };
      const cutoff = now - timeRanges[newFilters.timeRange];
      filtered = filtered.filter(alert => alert.timestamp >= cutoff);
    }

    // Sort
    switch (newFilters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.timestamp - a.timestamp);
        break;
      case 'oldest':
        filtered.sort((a, b) => a.timestamp - b.timestamp);
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    onFilteredAlertsChange(filtered);
  }, [alerts, onFilteredAlertsChange]);

  const updateFilters = useCallback((updates: Partial<FilterOptions>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    filterAlerts(newFilters);
  }, [filters, filterAlerts]);

  const handleSearchChange = useCallback((text: string) => {
    updateFilters({ searchQuery: text });
  }, [updateFilters]);

  const toggleAlertType = useCallback((type: string) => {
    const newTypes = filters.alertTypes.includes(type)
      ? filters.alertTypes.filter(t => t !== type)
      : [...filters.alertTypes, type];
    updateFilters({ alertTypes: newTypes });
  }, [filters.alertTypes, updateFilters]);

  const clearAllFilters = useCallback(() => {
    const clearedFilters = {
      searchQuery: '',
      alertTypes: [],
      timeRange: 'all' as const,
      sortBy: 'newest' as const,
    };
    setFilters(clearedFilters);
    filterAlerts(clearedFilters);
  }, [filterAlerts]);

  const hasActiveFilters = useMemo(() => {
    return filters.searchQuery.trim() !== '' ||
           filters.alertTypes.length > 0 ||
           filters.timeRange !== 'all' ||
           filters.sortBy !== 'newest';
  }, [filters]);

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search alerts, locations, or incident IDs..."
          value={filters.searchQuery}
          onChangeText={handleSearchChange}
          clearButtonMode="while-editing"
          autoCorrect={false}
        />
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          style={[styles.filterToggle, isExpanded && styles.filterToggleActive]}
        >
          <Text style={[styles.filterToggleText, isExpanded && styles.filterToggleTextActive]}>
            🔍 Filters {hasActiveFilters && '●'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Expanded Filters */}
      {isExpanded && (
        <View style={styles.filtersContainer}>
          {/* Time Range */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Time Range</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
              {[
                { key: 'all', label: 'All Time' },
                { key: 'today', label: 'Today' },
                { key: 'week', label: 'Past Week' },
                { key: 'month', label: 'Past Month' },
              ].map(option => (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => updateFilters({ timeRange: option.key as any })}
                  style={[
                    styles.filterOption,
                    filters.timeRange === option.key && styles.filterOptionActive
                  ]}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.timeRange === option.key && styles.filterOptionTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Sort By */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Sort By</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
              {[
                { key: 'newest', label: 'Newest First' },
                { key: 'oldest', label: 'Oldest First' },
                { key: 'alphabetical', label: 'A-Z' },
              ].map(option => (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => updateFilters({ sortBy: option.key as any })}
                  style={[
                    styles.filterOption,
                    filters.sortBy === option.key && styles.filterOptionActive
                  ]}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.sortBy === option.key && styles.filterOptionTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Alert Types */}
          {availableAlertTypes.length > 0 && (
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Alert Types</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
                {availableAlertTypes.map(type => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => toggleAlertType(type)}
                    style={[
                      styles.filterOption,
                      filters.alertTypes.includes(type) && styles.filterOptionActive
                    ]}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filters.alertTypes.includes(type) && styles.filterOptionTextActive
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <TouchableOpacity onPress={clearAllFilters} style={styles.clearFiltersButton}>
              <Text style={styles.clearFiltersText}>Clear All Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  filterToggle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
  },
  filterToggleActive: {
    backgroundColor: '#1976d2',
  },
  filterToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  filterToggleTextActive: {
    color: '#fff',
  },
  filtersContainer: {
    padding: 12,
    paddingTop: 0,
    backgroundColor: '#f9f9f9',
  },
  filterSection: {
    marginBottom: 12,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
  },
  filterOptionActive: {
    backgroundColor: '#1976d2',
  },
  filterOptionText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  clearFiltersButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#d32f2f',
    fontWeight: '500',
  },
});

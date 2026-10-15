#!/bin/bash
# This script updates all #CDFF00 references to #1E40AF (navy blue)
# To run: bash update_colors.sh

find components/views -name "*.tsx" -type f -exec sed -i 's/#CDFF00/#1E40AF/g' {} \;
echo "Color scheme updated successfully!"

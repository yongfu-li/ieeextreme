#include <algorithm>
#include <iostream>
#include <limits>

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n = 0;
    std::cin >> n;

    int min_x = std::numeric_limits<int>::max();
    int max_x = std::numeric_limits<int>::min();
    int min_y = std::numeric_limits<int>::max();
    int max_y = std::numeric_limits<int>::min();

    for (int i = 0; i < n; ++i) {
        int x = 0;
        int y = 0;
        std::cin >> x >> y;
        min_x = std::min(min_x, x);
        max_x = std::max(max_x, x);
        min_y = std::min(min_y, y);
        max_y = std::max(max_y, y);
    }

    const int width = max_x - min_x;
    const int height = max_y - min_y;
    std::cout << (width * height) << '\n';

    return 0;
}

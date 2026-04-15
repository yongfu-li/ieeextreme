#include <cstdint>
#include <iostream>
#include <queue>
#include <string>
#include <utility>
#include <vector>

namespace {

struct Cell {
    int row;
    int col;
};

bool is_inside(const int row, const int col, const int n, const int m) {
    return row >= 0 && row < n && col >= 0 && col < m;
}

}  // namespace

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n = 0;
    int m = 0;
    int k = 0;
    std::cin >> n >> m >> k;

    std::vector<std::string> grid(n);
    for (int i = 0; i < n; ++i) {
        std::cin >> grid[i];
    }

    const int unvisited = -1;
    std::vector<std::vector<int>> distance(n, std::vector<int>(m, unvisited));
    std::queue<Cell> bfs_queue;

    for (int i = 0; i < k; ++i) {
        int x = 0;
        int y = 0;
        std::cin >> x >> y;
        --x;
        --y;

        if (distance[x][y] == unvisited) {
            distance[x][y] = 0;
            bfs_queue.push({x, y});
        }
    }

    const int dr[4] = {1, -1, 0, 0};
    const int dc[4] = {0, 0, 1, -1};

    while (!bfs_queue.empty()) {
        const Cell current = bfs_queue.front();
        bfs_queue.pop();

        for (int dir = 0; dir < 4; ++dir) {
            const int nr = current.row + dr[dir];
            const int nc = current.col + dc[dir];
            if (!is_inside(nr, nc, n, m)) {
                continue;
            }
            if (grid[nr][nc] == '#') {
                continue;
            }
            if (distance[nr][nc] != unvisited) {
                continue;
            }

            distance[nr][nc] = distance[current.row][current.col] + 1;
            bfs_queue.push({nr, nc});
        }
    }

    std::int64_t total_distance = 0;
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < m; ++j) {
            if (grid[i][j] == '.') {
                total_distance += distance[i][j];
            }
        }
    }

    std::cout << total_distance << '\n';
    return 0;
}
